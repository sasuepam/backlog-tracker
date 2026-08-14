import subprocess, sys, os, time, shutil

def recalc(path):
    path = os.path.abspath(path)
    macro_dir = os.path.expanduser("~/Library/Application Support/LibreOffice/4/user/Scripts/python")
    os.makedirs(macro_dir, exist_ok=True)
    macro_path = os.path.join(macro_dir, "recalc_macro.py")
    with open(macro_path, "w") as f:
        f.write(
            "import uno\n"
            "def recalc_and_save():\n"
            "    ctx = XSCRIPTCONTEXT.getComponentContext()\n"
            "    desktop = XSCRIPTCONTEXT.getDesktop()\n"
        )
    profile_dir = "/tmp/lo_profile_recalc"
    subprocess.run(["pkill", "-f", "soffice"], capture_output=True)
    time.sleep(1)
    cmd = [
        "soffice", "--headless", "--norestore",
        f"-env:UserInstallation=file://{profile_dir}",
        "--convert-to", "xlsx:Calc MS Excel 2007 XML",
        "--outdir", os.path.dirname(path),
        path,
    ]
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    print(r.stdout)
    print(r.stderr)

if __name__ == "__main__":
    recalc(sys.argv[1])
