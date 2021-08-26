import Boat from './boat'
import Campfire from './campfire'
import CargoShip from './cargo-ship'
import Chainsaw from './chainsaw'
import Chipmunk from './chipmunk'
import Clearcutting from './clearcutting'
import Clipboard from './clipboard'
import Clinic from './clinic'
import Dam from './dam'
import Dolphin from './dolphin'
import Elephant from './elephant'
import Eye from './eye'
import Factory from './factory'
import Farmer from './farmer'
import FarmerFamily from './farmer-family'
import FarmerWife from './farmer-wife'
import Fox from './fox'
import Gorilla from './gorilla'
import HandOne from './hand-one'
import Hummingbird from './hummingbird'
import Logpile from './log-pile'
import Magnifier from './magnifier'
import Mining from './mining'
import Money from './money'
import Oil from './oil'
import PalmOil from './palm-oil'
import Play from './play'
import Sawblade from './sawblade'
import Star from './star'
import Tractor from './tractor'
import Truck from './truck'
import TugBoat from './tug-boat'
import Turtle from './turtle'
import Turtle2 from './turtle2'
import Video from './video'
import Village from './village'
import Whale from './whale'
import Wifi from './wifi'
import Wolf from './wolf'
const icons = {
  'maphubs-icon-boat': Boat,
  'maphubs-icon-campfire': Campfire,
  'maphubs-icon-cargo-ship': CargoShip,
  'maphubs-icon-chainsaw': Chainsaw,
  'maphubs-icon-chipmunk': Chipmunk,
  'maphubs-icon-clearcutting': Clearcutting,
  'maphubs-icon-clipboard': Clipboard,
  'maphubs-icon-clinic': Clinic,
  'maphubs-icon-dam': Dam,
  'maphubs-icon-dolphin': Dolphin,
  'maphubs-icon-elephant': Elephant,
  'maphubs-icon-eye': Eye,
  'maphubs-icon-factory': Factory,
  'maphubs-icon-farmer': Farmer,
  'maphubs-icon-farmer-family': FarmerFamily,
  'maphubs-icon-farmer-wife': FarmerWife,
  'maphubs-icon-fox': Fox,
  'maphubs-icon-gorilla': Gorilla,
  'maphubs-icon-hand-one': HandOne,
  'maphubs-icon-hummingbird': Hummingbird,
  'maphubs-icon-log-pile': Logpile,
  'maphubs-icon-magnifier': Magnifier,
  'maphubs-icon-mining': Mining,
  'maphubs-icon-money': Money,
  'maphubs-icon-oil': Oil,
  'maphubs-icon-palm-oil': PalmOil,
  'maphubs-icon-play': Play,
  'maphubs-icon-sawblade': Sawblade,
  'maphubs-icon-star': Star,
  'maphubs-icon-tractor': Tractor,
  'maphubs-icon-truck': Truck,
  'maphubs-icon-tug-boat': TugBoat,
  'maphubs-icon-turtle': Turtle,
  'maphubs-icon-turtle2': Turtle2,
  'maphubs-icon-video': Video,
  'maphubs-icon-village': Village,
  'maphubs-icon-whale': Whale,
  'maphubs-icon-wifi': Wifi,
  'maphubs-icon-wolf': Wolf
}
export default {
  getIcon(name: string): any {
    return icons[name]
  }
}