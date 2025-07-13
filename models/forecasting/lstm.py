import torch
import torch.nn as nn
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
import csv


class LSTMDemandPredictor(nn.Module):
    def __init__(self, input_size=1, hidden_size=64, num_layers=2, output_size=1):
        super(LSTMDemandPredictor, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.linear = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        out, _ = self.lstm(x)
        out = self.linear(out[:, -1, :])  # Take output from last timestep
        return out


def create_sequences(data, window_size):
    X, y = [], []
    for i in range(len(data) - window_size):
        X.append(data[i:i + window_size])
        y.append(data[i + window_size])
    X = np.array(X)
    y = np.array(y)
    return torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)


def run_lstm_pytorch(epochs=300, window_size=20, forecast_steps=10):
    df = pd.read_csv("inventory_log.csv")
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values(by="timestamp")
    demand = df['demand'].values.reshape(-1, 1)

    scaler = MinMaxScaler()
    demand_scaled = scaler.fit_transform(demand)

    X, y = create_sequences(demand_scaled, window_size)  
    
    X = X.view(-1, window_size, 1)  # Just to be sure

  
    model = LSTMDemandPredictor()
    loss_fn = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

  
    for epoch in range(epochs):
        model.train()
        output = model(X)
        loss = loss_fn(output, y)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if epoch % 10 == 0:
            print(f"Epoch {epoch}/{epochs}, Loss: {loss.item():.4f}")


    model.eval()
    future_preds = []
    last_seq = demand_scaled[-window_size:].tolist()

    for _ in range(forecast_steps):
        seq_tensor = torch.tensor([last_seq], dtype=torch.float32)  # Shape: [1, window, 1]
        with torch.no_grad():
            pred = model(seq_tensor).item()
        future_preds.append(pred)
        last_seq.append([pred])
        last_seq = last_seq[1:]

    forecast = scaler.inverse_transform(np.array(future_preds).reshape(-1, 1)).flatten()

    last_date = df['timestamp'].iloc[-1]
    future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=forecast_steps)
    forecast_df = pd.DataFrame({
        "timestamp": future_dates,
        "forecast_demand": forecast.astype(int)
    })

    forecast_df.to_csv("lstm_forecast.csv", index=False)
    print("\nForecasted Demand (LSTM):")
    print(forecast_df)

    plt.figure(figsize=(10, 5))
    plt.plot(df['timestamp'], df['demand'], label="Historical Demand")
    plt.plot(forecast_df['timestamp'], forecast_df['forecast_demand'], label="LSTM Forecast", linestyle="--", marker="o")
    plt.xlabel("Date")
    plt.ylabel("Demand")
    plt.title("LSTM Demand Forecast")
    plt.legend()
    plt.grid()
    plt.tight_layout()
    plt.show()

    return forecast_df

def pradheepwants5(self):
    with open('lstm_forecast.csv', 'r') as file:
        reader = csv.reader(file)
        rows = list(reader)

        value = rows[4][1]
        print("5th element from 2nd column:", value) 