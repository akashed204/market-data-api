nssm install MarketDataFastAPI
nssm set MarketDataFastAPI AppDirectory D:\Charu\API
nssm set MarketDataFastAPI AppExecutable D:\Charu\API\.venv\Scripts\python.exe
nssm set MarketDataFastAPI AppParameters Main.py
nssm set MarketDataFastAPI AppStdout D:\Charu\API\logs\fastapi-service.out.log
nssm set MarketDataFastAPI AppStderr D:\Charu\API\logs\fastapi-service.err.log
nssm set MarketDataFastAPI AppRestartDelay 5000
nssm set MarketDataFastAPI Start SERVICE_AUTO_START
nssm start MarketDataFastAPI
