import { createBrowserRouter, Navigate } from 'react-router-dom'
import { TripCreatePage } from '../pages/TripCreatePage'
import { TripListPage } from '../pages/TripListPage'

// ルートパスの一覧。画面が増えたらここにルートを追加する
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/trips" replace />,
  },
  {
    path: '/trips',
    element: <TripListPage />,
  },
  {
    path: '/trips/new',
    element: <TripCreatePage />,
  },
])
