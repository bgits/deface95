import React, { useState, useEffect } from "react";
import toBuffer from "it-to-buffer";
import { BufferList } from 'bl';
import { connect } from "react-redux";
import { fetchCoinsInfo, fetchCoinsData } from "../../store/actions/coins";
import CenteredHourglass from "../../components/CenteredHourglass/CenteredHourglass";
import useIpfsFactory from '../../hooks/use-ipfs-factory.js';
import useIpfs from '../../hooks/use-ipfs.js';
import Layout from "./Layout";

/** Uses `URL.createObjectURL` free returned ObjectURL with `URL.RevokeObjectURL` when done with it.
 * 
 * @param {string} cid CID you want to retrieve
 * @param {string} mime mimetype of image (optional, but useful)
 * @param {number} limit size limit of image in bytes
 * @returns ObjectURL
 */
async function loadImgURL(ipfs, cid, mime = 'image/svg+xml') {
  if (cid == "" || cid == null || cid == undefined) {
    return;
  }
  for await (const file of ipfs.cat(cid)) {
    const content = [];
    if (file) {
      for await(const chunk of file) {
        content.push(chunk);
      }
      return URL.createObjectURL(new Blob(content, {type: mime}));
    }
  }
}

async function getDirectoryInfo(ipfs, setState) {
  const cid = 'QmZsU8nTTexTxPzCKZKqo3Ntf5cUiWMRahoLmtpimeaCiT';
  const cids = [];

  for await (const file of ipfs.ls(cid)) {
    // do something with buf
    const files = [];
    if (file.type == 'dir') {
      for await (const f of ipfs.ls(file.path)) {
        if (f.type == 'file') {
          try {
            for await (const file of ipfs.get(f.path)) {
              const content = new BufferList();
              for await (const chunk of file) {
                content.append(chunk);
              }
            }
            const buffer = await toBuffer(ipfs.cat(f.path));
            const blob = new Blob(buffer);
            const image = new Image();
            image.src = URL.createObjectURL(blob);
            f.blob = blob;
            f.image = image;
            f.imageURL = `https://ipfs.io/ipfs/${f.path}`;
          } catch(e) {
            console.log({e, f});
          }
        }
        files.push(f);
      }
      file.files = files;
    }
    cids.push(file);
  }
  console.log({cids});
  setState(cids);
}

const Dashboard = ({
  topList,
  followed,
  coinsData,
  info,
  fetchCoinsInfo,
  fetchCoinsData
}) => {
  const [showFollowing, setShowFollowing] = useState(false);
  const [directory, setDirectory] = useState([]);
  const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ['id'] });
  const id = useIpfs(ipfs, 'id');

  useEffect(() => {
    if (!ipfs) return;
    window.ipfs = ipfs;
    getDirectoryInfo(ipfs, setDirectory);
  }, [ipfs]);

  useEffect(() => {
    if (!info) {
      //fetchCoinsInfo();
    } else {
      //fetchCoinsData();
    }
  }, [info, fetchCoinsInfo, topList, fetchCoinsData]);

  let data;
  let Ime;
  if (!info || !coinsData) {
    data = null;
  } else {
    data = (showFollowing ? followed : topList).map(coin => ({
      ...info[coin],
      ...coinsData[coin]
    }));
    if (directory.length) {
      Ime = `https://ipfs.io/ipfs/${directory[1]['files'][0]['path']}`
      //Ime = directory[1]['files'][0]['image'];
    }
  }
  console.log({data})
  if (!directory || !directory[1] || !directory[1]['files']) return <CenteredHourglass />;
  return (
    <Layout
      data={directory[1]['files']}
      showingFollowing={showFollowing}
      showFollowing={() => setShowFollowing(true)}
      showTop={() => setShowFollowing(false)}
    />
  );
};

const mapStateToProps = state => ({
  followed: state.user.followed,
  walletCoinsList: Object.keys(state.user.wallet),
  topList: state.coins.top,
  currency: state.user.currency,
  info: state.coins.info,
  coinsData: state.coins.coinsData
});

const mapDispatchToProps = dispatch => ({
  fetchCoinsInfo: () => dispatch(fetchCoinsInfo()),
  fetchCoinsData: () => dispatch(fetchCoinsData())
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
