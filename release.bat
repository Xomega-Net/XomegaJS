SET VER=%1
if exist "pkg\content\" rd /q /s "pkg\content"
xcopy "bin\xomega.d.ts" "pkg\content\Scripts\typings\xomegajs\" >nul
if exist "pkg\XomegaJS.%VER%" rd /q /s "pkg\XomegaJS.%VER%"
mkdir "pkg\XomegaJS.%VER%"
copy "bin\xomega.js" "pkg\content\Scripts\xomega-%VER%.js" >nul
call replace.bat {version} %VER% Package.nuspec > pkg\Package.nuspec
packages\NuGet.CommandLine.3.3.0\tools\NuGet.exe pack "pkg\Package.nuspec" -OutputDirectory "pkg\XomegaJS.%VER%"