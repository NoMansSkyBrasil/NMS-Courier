import { useEffect, useState } from 'react'
import { PackageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar'
import { gameIconImage } from '@renderer/lib/game-icon-image'

// The game's own icon of a catalogue entry, read from the selected installation. Until it is drawn,
// and for an entry without an icon, the standard placeholder is shown.
export function GameIcon({
  locator,
  size = 'default'
}: {
  locator: string | null | undefined
  size?: 'default' | 'sm' | 'lg'
}): React.JSX.Element {
  const [image, setImage] = useState<{ locator: string; address: string } | null>(null)

  useEffect(() => {
    if (!locator) return
    let active = true
    void gameIconImage(locator).then(
      (address) => active && address && setImage({ locator, address })
    )
    return () => {
      active = false
    }
  }, [locator])

  return (
    <Avatar size={size} className="rounded-lg after:rounded-lg">
      {locator && image?.locator === locator && (
        <AvatarImage src={image.address} alt="" className="rounded-lg" />
      )}
      <AvatarFallback className="rounded-lg">
        <PackageIcon />
      </AvatarFallback>
    </Avatar>
  )
}
