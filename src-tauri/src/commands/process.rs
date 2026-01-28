#[tauri::command]
pub fn kill_process(pid: u32) -> Result<(), String> {
  if pid == 0 {
    return Err("invalid pid".to_string());
  }

  #[cfg(target_os = "windows")]
  {
    let status = std::process::Command::new("taskkill")
      .args(["/PID", &pid.to_string(), "/T", "/F"])
      .status()
      .map_err(|e| e.to_string())?;
    if status.success() {
      Ok(())
    } else {
      Err(format!("taskkill failed: {status}"))
    }
  }

  #[cfg(not(target_os = "windows"))]
  {
    let status = std::process::Command::new("kill")
      .args(["-9", &pid.to_string()])
      .status()
      .map_err(|e| e.to_string())?;
    if status.success() {
      Ok(())
    } else {
      Err(format!("kill failed: {status}"))
    }
  }
}

