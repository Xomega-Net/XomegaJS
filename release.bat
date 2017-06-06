@echo off

SET VER=%1
SET NUGET_PATH=.nuget\NuGet.exe
SET NUGET_VERSION=latest
SET CACHED_NUGET=%LocalAppData%\NuGet\nuget.%NUGET_VERSION%.exe

IF '%VER%'=='' (
  echo Please use the following format: release.bat {version}
  goto end
)

IF NOT EXIST .nuget md .nuget
IF NOT EXIST %NUGET_PATH% (
  IF NOT EXIST %CACHED_NUGET% (
    echo Downloading latest version of NuGet.exe...
    IF NOT EXIST %LocalAppData%\NuGet ( 
      md %LocalAppData%\NuGet
    )
    @powershell -NoProfile -ExecutionPolicy unrestricted -Command "$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest 'https://dist.nuget.org/win-x86-commandline/%NUGET_VERSION%/nuget.exe' -OutFile '%CACHED_NUGET%'"
  )

  copy %CACHED_NUGET% %NUGET_PATH% > nul
)

IF EXIST "pkg\content\" rd /q /s "pkg\content"
xcopy "bin\xomega.d.ts" "pkg\content\Scripts\typings\xomegajs\" >nul
IF EXIST "pkg\XomegaJS.%VER%" rd /q /s "pkg\XomegaJS.%VER%"
md "pkg\XomegaJS.%VER%"
copy "bin\xomega.js" "pkg\content\Scripts\xomega-%VER%.js" >nul

@powershell (Get-Content -raw Package.nuspec) -replace '{version}', '%VER%' -replace '.*^<dependencies.*', ^
((Get-Content -raw packages.config) -replace '^.\?.*\n', '' ^
-replace 'packages', 'dependencies' -replace 'package', 'dependency' -replace ' targetFramework=\".*?\"', '' ^
-replace '(^<)', '________$1' -replace ' +_', '_____' -replace '_', ' ') > pkg\Package.nuspec

%NUGET_PATH% pack "pkg\Package.nuspec" -OutputDirectory "pkg\XomegaJS.%VER%"

rd /s /q pkg\content
del pkg\Package.nuspec

:end