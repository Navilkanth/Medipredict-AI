import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { ToastProvider } from "./context/ToastContext"
import { AppLayout } from "./layouts/AppLayout"
import { AddPatientPage } from "./pages/AddPatientPage"
import { AnalysisPage } from "./pages/AnalysisPage"
import { AnalyticsPage } from "./pages/AnalyticsPage"
import { DashboardPage } from "./pages/DashboardPage"
import { PatientsPage } from "./pages/PatientsPage"
import { SettingsPage } from "./pages/SettingsPage"

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="patients" element={<PatientsPage />} />
              <Route path="patients/new" element={<AddPatientPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
