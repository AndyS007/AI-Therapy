import { IconMoon, IconSun, IconLogout } from '@tabler/icons-react'
import { FC } from 'react'
import { SidebarButton } from './SidebarButton'
import { useAuth } from '../AuthProvider'

interface Props {
  lightMode: 'light' | 'dark'
  onToggleLightMode: (mode: 'light' | 'dark') => void
}

export const SidebarSettings: FC<Props> = ({
  lightMode,
  onToggleLightMode,
}) => {
  const { logOut } = useAuth()
  return (
    <>
      <div className="flex flex-col items-center border-t border-neutral-500 py-4">
        <SidebarButton
          text={'Log out'}
          icon={<IconLogout />}
          onClick={logOut}
        />
      </div>
      <div className="flex flex-col items-center border-t border-neutral-500 py-4">
        <SidebarButton
          text={lightMode === 'light' ? 'Dark mode' : 'Light mode'}
          icon={lightMode === 'light' ? <IconMoon /> : <IconSun />}
          onClick={() =>
            onToggleLightMode(lightMode === 'light' ? 'dark' : 'light')
          }
        />
      </div>
    </>
  )
}
