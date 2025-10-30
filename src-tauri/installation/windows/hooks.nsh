!macro NSIS_HOOK_PREINSTALL
  ; Append your app folder to the user-selected directory
  StrCpy $INSTDIR "$INSTDIR\StimEval"

  ; Make sure the directory exists
  CreateDirectory "$INSTDIR"
!macroend