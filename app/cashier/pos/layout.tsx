import AdminLayout from '../../admin/layout'

interface POSLayoutProps {
  children: React.ReactNode
}

export default function POSLayout({ children }: POSLayoutProps) {
  return (
    <AdminLayout>
      {children}
    </AdminLayout>
  )
} 