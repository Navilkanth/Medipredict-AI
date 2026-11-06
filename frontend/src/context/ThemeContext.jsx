import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  fontSize: "standard",
  setFontSize: () => {},
  settings: {},
  updateSettings: () => {},
})

const DEFAULT_SETTINGS = {
  facilityName: "MediPredict Medical Center",
  department: "Cardiology & General Health",
  physicianName: "Dr. A. Vance, MD",
  glucoseThreshold: 126,
  cholesterolThreshold: 200,
  rowsPerPage: 8,
  compactView: false,
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("medipredict_theme") || "light"
  })

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem("medipredict_fontsize") || "standard"
  })

  const [settings, setSettingsState] = useState(() => {
    try {
      const stored = localStorage.getItem("medipredict_app_settings")
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
    localStorage.setItem("medipredict_theme", theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("text-size-standard", "text-size-medium", "text-size-large")
    root.classList.add(`text-size-${fontSize}`)
    localStorage.setItem("medipredict_fontsize", fontSize)
  }, [fontSize])

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"))
  }

  function setFontSize(size) {
    setFontSizeState(size)
  }

  function updateSettings(next) {
    setSettingsState((prev) => {
      const updated = typeof next === "function" ? next(prev) : { ...prev, ...next }
      localStorage.setItem("medipredict_app_settings", JSON.stringify(updated))
      return updated
    })
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        fontSize,
        setFontSize,
        settings,
        updateSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

