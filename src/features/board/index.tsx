import { createContext, useCallback, useEffect, useState } from 'react'

import Canvas from '../canvas'
import Scale from '../scale'
import Card from '../card'
import Panel from '../../components/panel'
import Selector from '../selector'
import Search from '../search'

import style from './style/Board.module.scss'
import useFilterItems from './hooks/useFilterItems'
import useHighlightItems from './hooks/useHighlightItems'
import useRenderItems from './hooks/useRenderItems'
import parseYear from '../../utils/parseYear'

import { BoardProps } from './types'
import Map from '../map'
import Portal from '../../components/portal/portal'
import usePlaces from './hooks/usePlaces'
import dif from '../../utils/arrayDif'

export const BoardContext = createContext<any>(() => null)

export default function Board({ items, sets, tax }: BoardProps) {
  const [filters, setFilters] = useState([])

  const [typeFilters, setTypeFilters] = useState([])

  const [placeFilters, setPlaceFilters] = useState<any>([])

  const [highlights, setHighlights] = useState('')

  const filteredItems = useFilterItems(items, [
    { filters, prop: 'set' },
    { filters: typeFilters, prop: 'icon' },
    { filters: placeFilters, prop: 'place' },
  ])

  const highlightedItems = useHighlightItems(filteredItems, highlights)

  const [renderItems, start, end] = useRenderItems(highlightedItems)

  const dates = `(${end - start} years: ${parseYear(start)} to ${parseYear(end)})`

  const [selected, setSelected] = useState(null)

  const places = usePlaces(filteredItems)

  useEffect(() => {
    setPlaceFilters([])
  }, [dif(filters), dif(typeFilters)])

  const contextMethods: any = {
    setSelected,
    setHighlights,
  }

  return (
    <BoardContext.Provider value={contextMethods}>
      <div className={style.board}>
        <div className={style.main}>
          <main>
            <Scale start={start} end={end} />
            <Canvas items={renderItems} />
          </main>

          <aside>
            <header>
              <h1 className={style.title}>Early Classical Antiquity</h1>
              <p className={style.status}>
                {renderItems.filter((item) => item.display).length} items {dates}
              </p>
            </header>

            <Panel title='Highlight'>
              <Search />
            </Panel>

            {/* <Panel title='Civilizations'>
              <Selector
                tax={sets.map((set) => set)}
                filters={filters}
                onSetFilter={useCallback(setFilters, [filters])}
                theme={'big'}
              />
            </Panel> */}

            <Panel title='Types'>
              <Selector
                tax={tax || []}
                filters={typeFilters}
                onSetFilter={useCallback(setTypeFilters, [typeFilters])}
                useIcon={true}
              />
            </Panel>

            <Panel title='Places' className={style.places}>
              <Selector
                tax={places || []}
                filters={placeFilters}
                onSetFilter={useCallback(setPlaceFilters, [placeFilters])}
              />
            </Panel>

            <Panel className={style.map}>
              <Map places={places.filter((p) => (placeFilters.length ? placeFilters.includes(p.name) : true))} />
            </Panel>
          </aside>
        </div>
      </div>

      {selected && (
        <Portal>
          <Panel theme='standalone'>
            <Card {...selected} handleClose={() => setSelected(null)} />
          </Panel>
        </Portal>
      )}
    </BoardContext.Provider>
  )
}
