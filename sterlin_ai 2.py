from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
from prophet import Prophet
import pandas as pd
from datetime import datetime
import locale
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Cache dictionary to store forecast results
forecast_cache = {}

# Get historical data function
def get_historical_data(currency_pair):
    data = yf.download(currency_pair, start='2005-01-01', end=str(datetime.today().date()))
    if data.empty:
        raise ValueError(f"{currency_pair} verisi alınamadı. Lütfen daha sonra tekrar deneyin.")
    return data[['Close']].dropna()

# Forecast using Prophet model
def forecast_currency(currency_pair):
    if currency_pair in forecast_cache:
        return forecast_cache[currency_pair]
    
    data = get_historical_data(currency_pair)
    df = pd.DataFrame(data).reset_index()
    df.columns = ['ds', 'y']
    df['ds'] = df['ds'].dt.tz_localize(None)

    # Configure Prophet model with custom settings for each currency pair
    if currency_pair == 'USDTRY=X':
        model = Prophet(seasonality_mode='multiplicative', yearly_seasonality=True, weekly_seasonality=True, changepoint_prior_scale=0.05)
    elif currency_pair == 'EURTRY=X':
        model = Prophet(seasonality_mode='additive', yearly_seasonality=True, changepoint_prior_scale=0.2)
    else:
        model = Prophet(seasonality_mode='additive', yearly_seasonality=True, changepoint_prior_scale=0.2)

    model.fit(df)
    future = model.make_future_dataframe(periods=360)  # Reduced horizon to 180 days
    forecast = model.predict(future)
    predicted_value = max(forecast['yhat'].iloc[-1], 0)  # Ensure non-negative predictions
    
    forecast_cache[currency_pair] = predicted_value
    return predicted_value

# Forecast for gold
def forecast_gold():
    if 'Gram Altın' in forecast_cache:
        return forecast_cache['Gram Altın']
    
    gold_price = yf.download('GC=F', start='2000-01-01', end=str(datetime.today().date()))
    if gold_price.empty:
        raise ValueError("Altın fiyatı alınamadı.")
    
    gram_gold_price = gold_price['Close'].iloc[-1] / 31.1035
    usd_to_try = forecast_currency('USDTRY=X')
    predicted_gold_price = gram_gold_price * usd_to_try
    
    forecast_cache['Gram Altın'] = predicted_gold_price
    return predicted_gold_price

# Set locale with error handling
try:
    locale.setlocale(locale.LC_ALL, 'tr_TR.UTF-8')
except locale.Error:
    locale.setlocale(locale.LC_ALL, '')

@app.route('/yapayzeka-tahmin', methods=['POST', 'OPTIONS'])
def yapay_zeka_tahmin():
    if request.method == 'OPTIONS':
        return '', 204

    if request.method == 'POST':
        varliklar = request.json
        if not varliklar or not isinstance(varliklar, list):
            return jsonify({'error': 'Geçersiz veri formatı'}), 400

        tahmini_deger = 0

        for varlik in varliklar:
            name = varlik.get('name')
            amount = varlik.get('amount')

            if not name or amount is None:
                return jsonify({'error': 'Eksik veya geçersiz varlık bilgisi'}), 400

            try:
                logging.info(f"Processing asset: {name} with amount: {amount}")

                if name == "İngiliz Sterlini":
                    tahmini_fiyat = forecast_currency('GBPTRY=X')
                elif name == "Dolar":
                    tahmini_fiyat = forecast_currency('USDTRY=X')
                elif name == "Euro":
                    tahmini_fiyat = forecast_currency('EURTRY=X')
                elif name == "Gram Altın":
                    tahmini_fiyat = forecast_gold()
                else:
                    return jsonify({'error': 'Desteklenmeyen varlık'}), 400

                logging.info(f"{name} Tahmini Fiyat: {tahmini_fiyat}")
                tahmini_deger += amount * tahmini_fiyat
            except Exception as e:
                return jsonify({'error': f"{name} işleminde hata: {str(e)}"}), 500

        tahmini_deger = round(tahmini_deger, 2)
        formatted_value = f"{locale.format_string('%.2f', tahmini_deger, grouping=True).replace('.', ',')}₺"

        return jsonify({'tahmini_deger': formatted_value})

if __name__ == "__main__":
    app.run(debug=True)
