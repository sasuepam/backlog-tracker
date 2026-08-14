Option Explicit

' Set to True while an archive is running to prevent re-entry
Private bArchiving As Boolean

' -------------------------------------------------------------------------
' Triggered whenever any cell changes on any sheet.
' Acts only when: sheet = Backlog, column = F (Status), new value = "DONE"
' -------------------------------------------------------------------------
Private Sub Workbook_SheetChange(ByVal Sh As Object, ByVal Target As Range)
    If bArchiving Then Exit Sub
    If Sh.Name <> "Backlog" Then Exit Sub
    If Target.Column <> 6 Then Exit Sub          ' Col F = Status
    If Target.CountLarge > 1 Then Exit Sub        ' Single cell only

    Dim newStatus As String
    newStatus = UCase(Trim(CStr(Target.Value)))
    If newStatus <> "DONE" Then Exit Sub

    Dim rowNum As Long
    rowNum = Target.Row
    If rowNum <= 1 Then Exit Sub

    Dim reqId As String
    reqId = CStr(Sh.Cells(rowNum, 1).Value)       ' Col A = Req ID
    If reqId = "" Then Exit Sub

    ' --- Prevent the save + reload below from re-firing this event ---
    bArchiving = True
    Application.EnableEvents = False
    Application.ScreenUpdating = False

    On Error GoTo ErrorHandler

    ' Save so Python reads the latest data
    ThisWorkbook.Save

    ' Run auto_archive.py via AppleScript "do shell script"
    ' (do shell script runs with full user permissions, including ~/Documents access)
    Dim scriptPath As String
    scriptPath = "/Users/sarahsuda/Documents/MSCbacklogtracker/scripts/auto_archive.py"

    Dim result As String
    result = MacScript("do shell script " & Chr(34) & _
                       "python3 " & scriptPath & _
                       Chr(34))

    ' Reload the workbook from disk (Python just modified it)
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    bArchiving = False

    ThisWorkbook.UpdateFromFile

    MsgBox "'" & reqId & "' archived successfully." & Chr(10) & result, _
           vbInformation, "Archive Complete"
    Exit Sub

ErrorHandler:
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    bArchiving = False
    MsgBox "Archive error for " & reqId & ":" & Chr(10) & Err.Description & Chr(10) & Chr(10) & _
           "You can archive manually by running:" & Chr(10) & _
           "python3 " & scriptPath, _
           vbExclamation, "Archive Error"
End Sub
