Set WshShell = CreateObject("WScript.Shell")

WshShell.CurrentDirectory = "C:\Users\hctmt\Desktop\JFT_smart"

WshShell.Run "cmd /c python -m http.server 8003", 0, False

WScript.Sleep 1000

WshShell.Run "http://localhost:8003/", 1, False