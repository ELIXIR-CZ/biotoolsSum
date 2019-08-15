import React, {Component} from "react";
import ReactTable from "react-table";
import * as R from "ramda";

const subRows = (data, separator) => {
  const subRows = R.compose(
    R.dropLast(1),
    R.flatten,
    R.flip(R.zip)(R.repeat(separator, data.length)),
    R.map(t => <div>{t}</div>)
  )(data);
  return (<div>{subRows}</div>)
};

export default class ToolsBasicTable extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {list} = this.props;
    const cellSeparator = <div style={{height: 1, width: "100%", paddingBottom: 8, borderBottom: "1px solid black"}}/>;
    const columns = [
      {
        Header: 'Tool',
        id: 'name',
        accessor: ({name}) => name,
        sortable: true,
        sortMethod: (a, b) => {
          return a.toLowerCase() > b.toLowerCase() ? 1 : -1
        },
        filterable: true,
        filterMethod: (filter, row) => row[filter.id].toLowerCase().includes(filter.value.toLowerCase()),
        getProps: () => {
          return {
            style: {
              fontWeight: "bold"
            }
          }
        },
      },
      {
        Header: <div style={{display: "flex"}}><div style={{paddingTop: 5, paddingBottom: 5, flex: "1", borderRight: "1px solid rgba(0,0,0,0.1)"}}>Input</div><div style={{paddingTop: 5, paddingBottom: 5, flex: "1", borderRight: "1px solid rgba(0,0,0,0.1)"}}>Output</div><div style={{paddingTop: 5, paddingBottom: 5, flex: "1"}}>Operations</div></div>,
        headerStyle: {padding: 0},
        id: 'functions',
        accessor: R.prop('function'),
        minWidth: 400,
        sortable: false,
        getProps: () => {
          return {
            style: {
              padding: 0
            },
          };
        },
        Cell: data => {
          return (
            <ReactTable
              style={{border: 0}}
              showPagination={false}
              TheadComponent={props => null}
              minRows={0}
              columns={[
                {
                  Header: 'Input',
                  id: 'input',
                  accessor: R.compose(R.join(', '), R.map(R.compose(R.prop('term'), R.prop('data'))), R.propOr([], 'input'))
                },
                {
                  Header: 'Output',
                  id: 'output',
                  accessor: R.compose(R.join(', '), R.map(R.compose(R.prop('term'), R.prop('data'))), R.propOr([], 'output'))
                },
                {
                  Header: 'Operations',
                  id: 'operations',
                  accessor: R.compose(R.join(', '), R.map(R.prop('term')), R.propOr([], 'operation'))
                }
              ]}
              data={data.row.functions}
            />
          )
        }
      },
      // {
      //   Header: 'Input data',
      //   id: 'input',
      //   accessor: R.compose(
      //     // R.take(1),
      //     R.map(R.compose(R.join(', '), R.map(R.compose(R.prop('term'), R.prop('data'))), R.propOr([], 'input'))),
      //     R.propOr([], 'function'),
      //   ),
      //   Cell: data => subRows(data.row.input, cellSeparator)
      // },
      // {
      //   Header: 'Output data',
      //   id: 'output',
      //   accessor: R.compose(
      //     // R.take(1),
      //     R.map(R.compose(R.join(', '), R.map(R.compose(R.prop('term'), R.prop('data'))), R.propOr([], 'output'))),
      //     R.propOr([], 'function'),
      //   ),
      //   Cell: data => subRows(data.row.output, cellSeparator)
      // },
      // {
      //   Header: 'Operations',
      //   id: 'operations',
      //   accessor: R.compose(
      //     // R.take(1),
      //     R.map(R.compose(R.join(', '), R.map(R.prop('term')), R.propOr([], 'operation'))),
      //     R.propOr([], 'function')
      //   ),
      //   Cell: data => subRows(data.row.operations, cellSeparator)
      // },
      {
        Header: 'Platform',
        id: 'platform',
        accessor: ({operatingSystem}) => operatingSystem ? operatingSystem.map(s => s[0]).join(", ") : "",
      }, {
        Header: 'License',
        id: 'license',
        accessor: ({license}) => license,
      }
    ];


    return (
      <ReactTable
        minRows={1}
        columns={columns}
        data={list}
      />
    )
  }
}