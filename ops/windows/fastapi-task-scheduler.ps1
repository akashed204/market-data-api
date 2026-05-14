$ErrorActionPreference = "Stop"

$taskName = "MarketDataFastAPI"
$python = "D:\Charu\API\.venv\Scripts\python.exe"
$workingDirectory = "D:\Charu\API"

$action = New-ScheduledTaskAction `
  -Execute $python `
  -Argument "Main.py" `
  -WorkingDirectory $workingDirectory

$trigger = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -RestartCount 999 `
  -RestartInterval (New-TimeSpan -Minutes 1)

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -RunLevel Highest `
  -Force

Start-ScheduledTask -TaskName $taskName
