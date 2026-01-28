use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DetailedSystemInfo {
    pub os_name: String,
    pub os_version: String,
    pub os_build: String,
    pub os_manufacturer: String,
    pub os_architecture: String,
    pub system_manufacturer: String,
    pub system_model: String,
    pub bios_manufacturer: String,
    pub bios_version: String,
    pub total_memory: u64,
    pub time_zone: String,
    pub hotfixes: Vec<String>,
    pub network_adapters: Vec<NetworkAdapterInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NetworkAdapterInfo {
    pub name: String,
    pub description: String,
    pub mac_address: String,
    pub status: String,
}

#[tauri::command]
pub async fn get_detailed_system_info() -> Result<DetailedSystemInfo, String> {
    #[cfg(target_os = "windows")]
    {
        get_windows_system_info()
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("Not implemented for this OS yet".to_string())
    }
}

#[cfg(target_os = "windows")]
fn get_windows_system_info() -> Result<DetailedSystemInfo, String> {
    use std::os::windows::process::CommandExt;
    const CREATE_NO_WINDOW: u32 = 0x08000000;

    // 1. Get Computer Info
    let ps_script = "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-ComputerInfo | Select-Object OsName, OsVersion, OsBuildNumber, OsManufacturer, OsArchitecture, CsManufacturer, CsModel, BiosManufacturer, BiosVersion, TimeZone, TotalPhysicalMemory | ConvertTo-Json -Compress";

    let output = Command::new("powershell")
        .args(["-NoProfile", "-Command", ps_script])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Failed to execute PowerShell command: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "PowerShell command failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);

    #[derive(Deserialize)]
    #[serde(rename_all = "PascalCase")]
    struct WindowsComputerInfo {
        os_name: Option<String>,
        os_version: Option<String>,
        os_build_number: Option<String>, // often number or string, be careful
        os_manufacturer: Option<String>,
        os_architecture: Option<String>,
        cs_manufacturer: Option<String>,
        cs_model: Option<String>,
        bios_manufacturer: Option<String>,
        bios_version: Option<String>,
        time_zone: Option<String>,
        total_physical_memory: Option<u64>,
    }

    // Handle potential string/number mismatch for build number by using serde_json::Value or specific type if known.
    // PowerShell ConvertTo-Json usually outputs numbers for numbers.
    // However, OsBuildNumber might be string in some versions? Let's use serde_json::Value to be safe or String.
    // Actually, let's try strict types but handle failure.

    let info: WindowsComputerInfo = serde_json::from_str(&json_str)
        .map_err(|e| format!("Failed to parse JSON: {} | Input: {}", e, json_str))?;

    // 2. Get Hotfixes (Limit to recent 10 or just count? User said 'Hotfix(s): ...' which lists them)
    // Detailed list might be long. Let's just get IDs.
    let hotfix_script =
        "Get-HotFix | Select-Object -ExpandProperty HotFixID | ConvertTo-Json -Compress";
    let hotfix_output = Command::new("powershell")
        .args(["-NoProfile", "-Command", hotfix_script])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let hotfixes: Vec<String> = if let Ok(out) = hotfix_output {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout);
            // If only one, it returns string, if multiple, array.
            if s.trim().starts_with('[') {
                serde_json::from_str(&s).unwrap_or_default()
            } else if !s.trim().is_empty() {
                vec![s.trim().trim_matches('"').to_string()]
            } else {
                vec![]
            }
        } else {
            vec![]
        }
    } else {
        vec![]
    };

    // 3. Network Adapters
    let net_script = "[Console]::OutputEncoding = [System.Text.Encoding]::UTF8; Get-NetAdapter | Select-Object Name, InterfaceDescription, MacAddress, Status | ConvertTo-Json -Compress";
    let net_output = Command::new("powershell")
        .args(["-NoProfile", "-Command", net_script])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let mut network_adapters = Vec::new();
    if let Ok(out) = net_output {
        if out.status.success() {
            let s = String::from_utf8_lossy(&out.stdout);
            #[derive(Deserialize)]
            #[serde(rename_all = "PascalCase")]
            struct WinNetAdapter {
                name: String,
                interface_description: String,
                mac_address: Option<String>,
                status: String,
            }

            // Handle single object vs array
            if s.trim().starts_with('[') {
                if let Ok(adapters) = serde_json::from_str::<Vec<WinNetAdapter>>(&s) {
                    for a in adapters {
                        network_adapters.push(NetworkAdapterInfo {
                            name: a.name,
                            description: a.interface_description,
                            mac_address: a.mac_address.unwrap_or_default(),
                            status: a.status,
                        });
                    }
                }
            } else if !s.trim().is_empty() {
                if let Ok(a) = serde_json::from_str::<WinNetAdapter>(&s) {
                    network_adapters.push(NetworkAdapterInfo {
                        name: a.name,
                        description: a.interface_description,
                        mac_address: a.mac_address.unwrap_or_default(),
                        status: a.status,
                    });
                }
            }
        }
    }

    Ok(DetailedSystemInfo {
        os_name: info.os_name.unwrap_or_default(),
        os_version: info.os_version.unwrap_or_default(),
        os_build: info
            .os_build_number
            .map(|n| n.to_string())
            .unwrap_or_default(),
        os_manufacturer: info.os_manufacturer.unwrap_or_default(),
        os_architecture: info.os_architecture.unwrap_or_default(),
        system_manufacturer: info.cs_manufacturer.unwrap_or_default(),
        system_model: info.cs_model.unwrap_or_default(),
        bios_manufacturer: info.bios_manufacturer.unwrap_or_default(),
        bios_version: info.bios_version.unwrap_or_default(),
        total_memory: info.total_physical_memory.unwrap_or(0),
        time_zone: info.time_zone.unwrap_or_default(),
        hotfixes,
        network_adapters,
    })
}
