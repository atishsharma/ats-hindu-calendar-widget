; Remove the "Start at login" entry the app writes, so no stale Run key is left behind.
!macro customUnInstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "AtsHinduCalendar"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run" "AtsHinduCalendar"
!macroend
