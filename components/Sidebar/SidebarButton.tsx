import { FC } from 'react'

interface Props {
  icon: JSX.Element
  onClick: () => void
}

export const SidebarButton: FC<Props> = ({ icon, onClick }) => {
  return (
    <div
      className="flex hover:bg-[#343541] justify-center py-2 px-4 rounded-md cursor-pointer w-[20px] items-center"
      onClick={onClick}
    >
      <div className="mr-3">{icon}</div>
    </div>
  )
}
