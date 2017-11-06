import 'babel-polyfill'
import React from 'react'
import * as R from 'ramda'
import ReactTable from 'react-table'
import ReadMore from '../common/ReadMore'
import { Label } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { OverlayTooltip } from '../common/OverlayTooltip'
import ShowMore from '../common/ShowMore'
import { MAIN_ROW_CELLS_COUNT, PAGE_SIZE } from '../../constants/toolsTable'
import { getCellsCount } from '../../biotoolsSum/services/index'

function getPublicationLink (publication, index) {
  if (publication.doi) {
    return <OverlayTooltip key={publication.doi} id='tooltip-doi' tooltipText='DOI'>
      <a href={`https://dx.doi.org/${publication.doi}`} target='_blank'>
        {index}
      </a>
    </OverlayTooltip>
  }
  if (publication.pmid) {
    return <OverlayTooltip key={publication.pmid} id='tooltip-pubmed' tooltipText='PUBMED'>
      <a href={`https://www.ncbi.nlm.nih.gov/pubmed/${publication.pmid}`} target='_blank'>
        {index}
      </a>
    </OverlayTooltip>
  }
  if (publication.pmcid) {
    return <OverlayTooltip key={publication.pmcid} id='tooltip-pmc' tooltipText='PMC'>
      <a href={`https://www.ncbi.nlm.nih.gov/pmc/articles/${publication.pmcid}`} target='_blank'>
        {index}
      </a>
    </OverlayTooltip>
  }
}

function getCitationsSource (idSourcePair, index) {
  return <OverlayTooltip key={idSourcePair[0]} id='tooltip-pmid' tooltipText='Citations source'>
    <a href={`http://europepmc.org/search?query=CITES%3A${idSourcePair[0]}_${idSourcePair[1]}`} target='_blank'>
      {index}
    </a>
  </OverlayTooltip>
}

const getColumns = (includePropsChosen) => {
  const isInfoMode = includePropsChosen === undefined

  let columns = [{
    Header: `Name ${isInfoMode ? '(Sortable, filterable)' : ''}`,
    id: 'name',
    accessor: data => data.name,
    sortable: isInfoMode,
    sortMethod: (a, b) => {
      return a.toLowerCase() > b.toLowerCase() ? 1 : -1
    },
    filterable: isInfoMode,
    filterMethod: (filter, row) => row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
    Cell: data => {
      const {id, version, name, homepage, toolType} = data.original
      return <div>
        <a href={homepage} target='_blank'>{name}</a>
        {version && <span>{` v.${version}`}</span>}
        <OverlayTooltip id='tooltip-windows' tooltipText={`Bio.tools: ${name}`}>
          <a href={`https://bio.tools/${id}`} target='_blank'>
            <FontAwesome className='icons' name='question-circle' />
          </a>
        </OverlayTooltip>
        {(isInfoMode || includePropsChosen.includes('toolType')) &&
          <div>
            <hr className='table-delimiter' />
            <p>
              {toolType.map((value, index) =>
                <span key={index}>
                  <Label bsStyle='warning'>{value}</Label>
                  <br />
                </span>
              )}
            </p>
          </div>
        }
      </div>
    },
    minWidth: 120,
  }]

  if (isInfoMode || includePropsChosen.includes('institute')) {
    columns.push(
      {
        Header: 'Institute',
        id: 'institute',
        accessor: data => data.credit,
        Cell: data => data.value.length > 0
          ? <ul className='table-list-item'>
            {data.value.map((institute, index) =>
              <li key={index}>{institute.name}</li>
            )}
          </ul>
          : <div />,
        minWidth: 150,
      }
    )
  }

  if (isInfoMode || includePropsChosen.includes('description')) {
    columns.push(
      {
        Header: `Description ${isInfoMode ? '(Filterable)' : ''}`,
        id: 'description',
        accessor: data => data.description,
        filterable: isInfoMode,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
        Cell: data => <ReadMore chars={350} text={data.value} />,
        minWidth: 150,
      }
    )
  }

  const includePublications = !isInfoMode && includePropsChosen.includes('publication')
  const includeCitations = !isInfoMode && includePropsChosen.includes('citations')
  if (isInfoMode || includePublications || includeCitations) {
    columns.push(
      {
        Header: `Publications info ${isInfoMode ? '(Sortable)' : ''}`,
        id: 'additional-info',
        accessor: data => R.isNil(data.citations) ? '-' : data.citations,
        sortable: isInfoMode,
        sortMethod: (a, b) => {
          if (a === '-') return -1
          if (b === '-') return 1
          return a - b
        },
        Cell: data => {
          const { publication: publications, publicationsIdSourcePairs } = data.original
          const citations = data.value
          const filteredPublications = R.filter(
            publication => publication.doi !== null || publication.pmid !== null || publication.pmcid !== null,
            publications
          )

          return <div>
            {(isInfoMode || includePublications) &&
              <div>
                <strong>{'Publications: '}</strong>
                {filteredPublications.length > 0
                  ? filteredPublications.map((publication, index) =>
                    <span key={index}>
                      {'['}
                      {getPublicationLink(publication, index + 1)}
                      {index + 1 < filteredPublications.length ? '], ' : ']'}
                    </span>
                  )
                  : 'no'
                }
              </div>
            }
            {(isInfoMode || (includePublications && includeCitations)) &&
              <hr className='table-delimiter' />
            }
            {(isInfoMode || includeCitations) &&
              <div>
                <strong>
                  {`Total Citations: ${citations}`}
                </strong>
                <br />
                <strong>{`Citations source: `}</strong>
                {publicationsIdSourcePairs && publicationsIdSourcePairs.length > 0 && citations > 0
                  ? publicationsIdSourcePairs.map((idSourcePair, index) =>
                    <span key={index}>
                      {'['}
                      {getCitationsSource(idSourcePair, index + 1)}
                      {index + 1 < publicationsIdSourcePairs.length ? '], ' : ']'}
                    </span>
                  )
                  : '-'
                }
              </div>
            }
          </div>
        },
        minWidth: 90,
        className: '',
      }
    )
  }

  return columns
}

const getSubColumns = (includePropsChosen) => {
  let subColumns = []
  const isInfoMode = includePropsChosen === undefined

  if (isInfoMode || includePropsChosen.includes('topic')) {
    subColumns.push(
      {
        Header: 'Topic',
        id: 'topic',
        accessor: data => <ShowMore lines={3} searchTermName='topic' list={data.topic} ulClassName='table-list-item' />,
        minWidth: 120,
      }
    )
  }

  if (isInfoMode || includePropsChosen.includes('function')) {
    subColumns.push(
      {
        Header: 'Function',
        id: 'function',
        accessor: data => <ShowMore lines={3} searchTermName='function' list={data.func || data.function} ulClassName='table-list-item' />,
        minWidth: 120,
      }
    )
  }

  const includeMaturity = !isInfoMode && includePropsChosen.includes('maturity')
  const includePlatform = !isInfoMode && includePropsChosen.includes('platform')
  if (isInfoMode || includeMaturity || includePlatform) {
    subColumns.push(
      {
        Header: 'Additional info',
        id: 'additional-info',
        Cell: data => {
          const { maturity, operatingSystem } = data.original
          const labelStyle = maturity === 'Mature' ? 'success' : maturity === 'Emerging' ? 'info' : 'danger'

          if (!maturity && operatingSystem.length === 0) {
            return <span>{'No additional info available'}</span>
          }

          return <div>
            {(isInfoMode || (includeMaturity && maturity)) &&
              <div>
                <strong>
                  {'Maturity: '}
                </strong>
                <Label bsStyle={labelStyle} className='label-margin'>
                  {maturity}
                </Label>
              </div>
            }

            {(isInfoMode || (includeMaturity && includePlatform && maturity && operatingSystem.length > 0)) &&
              <hr className='table-delimiter' />
            }

            {(isInfoMode || (includePlatform && operatingSystem.length > 0)) &&
              <div>
                <strong>{'Platforms: '}</strong>
                {R.contains('Windows', operatingSystem) &&
                  <OverlayTooltip id='tooltip-windows' tooltipText='Platform: Windows'>
                    <FontAwesome className='icons' name='windows' />
                  </OverlayTooltip>
                }
                {R.contains('Linux', operatingSystem) &&
                  <OverlayTooltip id='tooltip-linux' tooltipText='Platform: Linux'>
                    <FontAwesome className='icons' name='linux' />
                  </OverlayTooltip>
                }
                {R.contains('Mac', operatingSystem) &&
                  <OverlayTooltip id='tooltip-mac' tooltipText='Platform: Mac'>
                    <FontAwesome className='icons' name='apple' />
                  </OverlayTooltip>
                }
              </div>
            }
          </div>
        },
        minWidth: 80,
      }
    )
  }

  return subColumns
}

const expander = {
  expander: true,
  Header: 'More',
  width: 55,
  Expander: ({isExpanded, ...rest}) =>
    isExpanded
      ? <OverlayTooltip id='tooltip-show-less-info' tooltipText='Show less info'>
        <FontAwesome className='more-icon' name='minus' />
      </OverlayTooltip>
      : <OverlayTooltip id='tooltip-show-more-info' tooltipText='Show more info'>
        <FontAwesome className='more-icon' name='plus' />
      </OverlayTooltip>,
  className: 'table-expander',
}

export const ToolsTable = ({ list, includePropsChosen }) => {
  let columns = getColumns(includePropsChosen)
  const subColumns = getSubColumns(includePropsChosen)
  const cellsPerRowCount = getCellsCount(includePropsChosen)

  if (cellsPerRowCount <= MAIN_ROW_CELLS_COUNT) {
    columns = R.concat(columns, subColumns)
  } else {
    columns.push(expander)
  }

  return (
    <ReactTable
      data={list}
      columns={columns}
      resizable={false}
      sortable={false}
      showPaginationTop
      showPageSizeOptions={false}
      defaultPageSize={PAGE_SIZE}
      minRows={1}
      className='-highlight'
      SubComponent={cellsPerRowCount <= MAIN_ROW_CELLS_COUNT ? null : row => {
        const subList = [{
          func: row.original.function,
          topic: row.original.topic,
          maturity: row.original.maturity,
          operatingSystem: row.original.operatingSystem,
        }]
        return (
          <div className='sub-table'>
            <ReactTable
              data={subList}
              columns={subColumns}
              defaultPageSize={1}
              showPagination={false}
              sortable={false}
            />
          </div>
        )
      }}
    />
  )
}
