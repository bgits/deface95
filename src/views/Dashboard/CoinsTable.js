import React from "react";
import PropTypes from "prop-types";

import { withRouter } from "react-router-dom";
import styled from "styled-components";
import {
  TableHead,
  TableBody,
  TableRow,
  TableHeadCell,
  TableDataCell
} from "react95";
import FileIcon from "../../components/FileIcon/FileIcon";
import FlexTable from "../../components/FlexTable/FlexTable";

class CoinsTable extends React.Component {
  handleChangeOrder = orderBy => {
    const { history } = this.props;
    const currentSearchParams = new URLSearchParams(history.location.search);
    const currentOrderBy = currentSearchParams.get("orderBy");
    let desc;

    if (currentOrderBy === orderBy) {
      desc = !(currentSearchParams.get("desc") === "true" ? true : false);
    } else {
      desc = orderBy === "name" ? false : true;
    }

    const location = {
      pathname: history.location.pathname,
      search: `?orderBy=${orderBy}&desc=${desc}`,
      hash: history.location.hash
    };
    history.push(location);
  };

  render() {
    let { history, data, location } = this.props;
    const searchParams = new URLSearchParams(history.location.search);
    let orderBy = searchParams.get("orderBy");
    let desc = searchParams.get("desc") === "false" ? -1 : 1;

    if (!location.search.includes('orderBy')) {
      orderBy = 'price';
      desc = 1;
    }


    const orderPairs = {
      price: "PRICE",
      change: "CHANGEPCT24HOUR",
      name: "coinName"
    };

    let tableData;
    if (!data) {
      tableData = null;
    } else {
      // dealing with case where there's no current price and change data of coin
      data = data.map(dataPoint => ({
        ...dataPoint,
        PRICE: dataPoint.PRICE || 0,
        CHANGEPCT24HOUR: dataPoint.CHANGEPCT24HOUR || 0
      }));
      let order = orderPairs[orderBy];
      desc = order === orderPairs.name ? -desc : desc;
      const orderedData = data.sort((a, b) => {
        return (b[order] > a[order] ? 1 : -1) * desc;
      });
      tableData = orderedData.map((coinData, i) => {
        const {
          name,
          coinName,
          symbol,
          imageURL,
          PRICE = 0,
          CHANGEPCT24HOUR = 0
        } = coinData;
        return (
          <TableRow key={i} onClick={() => history.push(`/coins/${symbol}`)}>
            <TableDataCell>
              <CoinName>
                {`${name.toLowerCase()}`}
              </CoinName>
            </TableDataCell>
            <TableDataCell style={{ textAlign: "center" }}>
              <img style={{ height: '2em' }} src={imageURL} />
            </TableDataCell>
            <TableDataCell style={{ textAlign: "right" }}>
              {Math.floor(Math.random() * (100 - 1 + 1) + 1)}
            </TableDataCell>
          </TableRow>
        );
      });
    }
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell onClick={() => this.handleChangeOrder("name")}>
              Name
            </TableHeadCell>
            <TableHeadCell onClick={() => this.handleChangeOrder("price")}>
              Preview
            </TableHeadCell>
            <TableHeadCell onClick={() => this.handleChangeOrder("change")}>
              Left To Mint
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>{tableData}</TableBody>
      </Table>
    );
  }
}

CoinsTable.propTypes = {
  data: PropTypes.array
};

export default withRouter(CoinsTable);

const SFileIcon = styled(FileIcon)`
  margin-right: 6px;
`;
const CoinName = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Table = styled(FlexTable)`
  th:nth-child(1),
  td:nth-child(1) {
    flex: 4;
  }
  td:nth-child(1) {
    display: flex;
    align-items: center;
    overflow: hidden;
  }
  th:nth-child(2),
  td:nth-child(2) {
    flex: 2;
  }

  th:nth-child(3),
  td:nth-child(3) {
    flex: 1.5;
  }
`;
