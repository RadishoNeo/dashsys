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
    #[cfg(target_os = "macos")]
    {
        get_mac_system_info()
    }
    #[cfg(target_os = "linux")]
    {
        get_linux_system_info()
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Not implemented for this OS yet".to_string())
    }
}

#[cfg(target_os = "macos")]
fn get_mac_system_info() -> Result<DetailedSystemInfo, String> {
    // 1. Get Software Info
    let output = Command::new("system_profiler")
        .args([
            "SPSoftwareDataType",
            "SPHardwareDataType",
            "SPNetworkDataType",
            "-json",
        ])
        .output()
        .map_err(|e| format!("Failed to execute system_profiler: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "system_profiler failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let value: serde_json::Value =
        serde_json::from_str(&json_str).map_err(|e| format!("Failed to parse JSON: {}", e))?;

    // Parse Software Info
    let software_info = value["SPSoftwareDataType"].get(0);
    let os_version = software_info
        .and_then(|v| v["os_version"].as_str())
        .unwrap_or("Unknown");
    let kernel_version = software_info
        .and_then(|v| v["kernel_version"].as_str())
        .unwrap_or("Unknown");
    let computer_name = software_info
        .and_then(|v| v["computer_name"].as_str())
        .unwrap_or("Unknown");
    let user_name = software_info
        .and_then(|v| v["user_name"].as_str())
        .unwrap_or("Unknown");

    // Parse Hardware Info
    let hardware_info = value["SPHardwareDataType"].get(0);
    let machine_name = hardware_info
        .and_then(|v| v["machine_name"].as_str())
        .unwrap_or("Unknown");
    let machine_model = hardware_info
        .and_then(|v| v["machine_model"].as_str())
        .unwrap_or("Unknown");
    let cpu_type = hardware_info
        .and_then(|v| v["cpu_type"].as_str())
        .unwrap_or("Unknown");
    let physical_memory = hardware_info
        .and_then(|v| v["physical_memory"].as_str())
        .unwrap_or("0 GB");
    let serial_number = hardware_info
        .and_then(|v| v["serial_number"].as_str())
        .unwrap_or("Unknown");
    let boot_rom_version = hardware_info
        .and_then(|v| v["boot_rom_version"].as_str())
        .unwrap_or("Unknown");

    // Parse Memory string (e.g., "16 GB")
    let total_memory = if let Some((num, unit)) = physical_memory.split_once(' ') {
        let n: u64 = num.parse().unwrap_or(0);
        match unit {
            "GB" => n * 1024 * 1024 * 1024,
            "MB" => n * 1024 * 1024,
            "KB" => n * 1024,
            _ => n,
        }
    } else {
        0
    };

    // Parse Network Info
    let mut network_adapters = Vec::new();
    if let Some(adapters) = value["SPNetworkDataType"].as_array() {
        for adapter in adapters {
            if let Some(name) = adapter["_name"].as_str() {
                let interface = adapter["interface"].as_str().unwrap_or("");
                let mac = adapter["MAC Address"].as_str().unwrap_or("");
                // Simple status check logic could be improved
                let status = "Unknown"; // specific status might not be in basic json, often implies 'ip_address' existence = Up

                network_adapters.push(NetworkAdapterInfo {
                    name: name.to_string(),
                    description: interface.to_string(),
                    mac_address: mac.to_string(),
                    status: status.to_string(),
                });
            }
        }
    }

    // Timezone
    let tz_output = Command::new("date").arg("+%Z").output();
    let time_zone = if let Ok(out) = tz_output {
        String::from_utf8_lossy(&out.stdout).trim().to_string()
    } else {
        "Unknown".to_string()
    };

    Ok(DetailedSystemInfo {
        os_name: "macOS".to_string(),
        os_version: os_version.to_string(),
        os_build: kernel_version.to_string(),
        os_manufacturer: "Apple Inc.".to_string(),
        os_architecture: std::env::consts::ARCH.to_string(),
        system_manufacturer: "Apple Inc.".to_string(),
        system_model: format!("{} ({})", machine_name, machine_model),
        bios_manufacturer: "Apple Inc.".to_string(),
        bios_version: boot_rom_version.to_string(),
        total_memory,
        time_zone,
        hotfixes: vec![], // macOS updates are different
        network_adapters,
    })
}

#[cfg(target_os = "linux")]
fn get_linux_system_info() -> Result<DetailedSystemInfo, String> {
    use std::fs;

    // Helper to read file content trimmed
    let read_file = |path: &str| -> String {
        fs::read_to_string(path)
            .unwrap_or_default()
            .trim()
            .to_string()
    };

    // Helper to run command
    let run_cmd = |cmd: &str, args: &[&str]| -> String {
        Command::new(cmd)
            .args(args)
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
            .unwrap_or_default()
    };

    // OS Info
    let os_release = read_file("/etc/os-release");
    let mut os_name = "Linux".to_string();
    let mut os_version = "Unknown".to_string();

    for line in os_release.lines() {
        if line.starts_with("PRETTY_NAME=") {
            os_name = line.replace("PRETTY_NAME=", "").replace("\"", "");
        }
        if line.starts_with("VERSION_ID=") {
            os_version = line.replace("VERSION_ID=", "").replace("\"", "");
        }
    }

    let kernel_version = run_cmd("uname", &["-r"]);

    // Hardware Info (DMI) - may fail without root, fallback gracefully
    let sys_vendor = read_file("/sys/class/dmi/id/sys_vendor");
    let product_name = read_file("/sys/class/dmi/id/product_name");
    let bios_vendor = read_file("/sys/class/dmi/id/bios_vendor");
    let bios_version = read_file("/sys/class/dmi/id/bios_version");
    let board_vendor = read_file("/sys/class/dmi/id/board_vendor");

    let system_manufacturer = if !sys_vendor.is_empty() {
        sys_vendor
    } else {
        "Unknown".to_string()
    };
    let system_model = if !product_name.is_empty() {
        product_name
    } else {
        "Unknown".to_string()
    };
    let bios_manufacturer = if !bios_vendor.is_empty() {
        bios_vendor
    } else {
        "Unknown".to_string()
    };
    let bios_ver = if !bios_version.is_empty() {
        bios_version
    } else {
        "Unknown".to_string()
    };

    // Memory
    let meminfo = read_file("/proc/meminfo");
    let mut total_memory = 0;
    for line in meminfo.lines() {
        if line.starts_with("MemTotal:") {
            if let Some(kb_str) = line.split_whitespace().nth(1) {
                if let Ok(kb) = kb_str.parse::<u64>() {
                    total_memory = kb * 1024;
                }
            }
            break;
        }
    }

    // Timezone
    let time_zone = run_cmd("date", &["+%Z"]);

    // Network
    let mut network_adapters = Vec::new();
    // Use ip -j addr if available, or just list /sys/class/net
    if let Ok(entries) = fs::read_dir("/sys/class/net") {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name == "lo" {
                continue;
            }

            let mac_path = entry.path().join("address");
            let mac_address = read_file(mac_path.to_str().unwrap_or(""));
            let operstate_path = entry.path().join("operstate");
            let status = read_file(operstate_path.to_str().unwrap_or(""));

            network_adapters.push(NetworkAdapterInfo {
                name: name.clone(),
                description: name,
                mac_address,
                status,
            });
        }
    }

    Ok(DetailedSystemInfo {
        os_name,
        os_version,
        os_build: kernel_version,
        os_manufacturer: "Linux".to_string(),
        os_architecture: std::env::consts::ARCH.to_string(),
        system_manufacturer,
        system_model,
        bios_manufacturer,
        bios_version: bios_ver,
        total_memory,
        time_zone,
        hotfixes: vec![],
        network_adapters,
    })
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
