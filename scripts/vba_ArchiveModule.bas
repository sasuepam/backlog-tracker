Option Explicit

' -------------------------------------------------------------------------
' RunArchiveManually
' Add this to the Quick Access Toolbar or run from Tools > Macros.
' Archives any Backlog items that are already marked Done but not yet in
' a Quarter tab (e.g. items changed before the VBA was installed).
' -------------------------------------------------------------------------
Sub RunArchiveManually()
    Dim scriptPath As String
    scriptPath = "/Users/sarahsuda/Documents/MSCbacklogtracker/scripts/auto_archive.py"

    Dim result As String
    On Error GoTo ErrorHandler

    ThisWorkbook.Save

    result = MacScript("do shell script " & Chr(34) & _
                       "python3 " & scriptPath & _
                       Chr(34))

    ThisWorkbook.UpdateFromFile
    MsgBox "Archive complete." & Chr(10) & result, vbInformation, "Archive"
    Exit Sub

ErrorHandler:
    MsgBox "Error: " & Err.Description, vbExclamation, "Archive Error"
End Sub
