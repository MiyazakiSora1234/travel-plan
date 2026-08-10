import { createBrowserRouter, Navigate } from 'react-router-dom'
import { TripCreatePage } from '../pages/TripCreatePage'

// ルートパスの一覧。画面が増えたらここにルートを追加する
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/trips/new" replace />,
  },
  {
    path: '/trips/new',
    element: <TripCreatePage />,
  },
])
