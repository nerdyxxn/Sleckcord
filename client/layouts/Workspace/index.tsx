import React, { VFC, useCallback, useState } from 'react';
import fetcher from '@utils/fetcher';
import useSWR from 'swr';
import axios from 'axios';
import { Route, Routes, Link } from 'react-router-dom';
import gravatar from 'gravatar';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceModal,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from '@layouts/Workspace/styles';
import loadable from '@loadable/component';
import Menu from '@components/Menu';
import { IUser, IChannel } from '@typings/db';
import CreateChannelModal from '@components/Modal/ChannelCreate';
import CreateWorkspaceModal from '@components/Modal/WorkspaceCreate';
import { useParams } from 'react-router';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: VFC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const { workspace } = useParams<{ workspace: string; channel: string }>();

  const {
    data: userData,
    error,
    mutate,
  } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 2000,
  });

  const { data: channelData, mutate: mutateChannel } = useSWR<IChannel[]>(
    userData ? `http://localhost:3095/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  const onLogout = useCallback(() => {
    axios
      .post('http://localhost:3095/api/users/logout', null, { withCredentials: true })
      .then((response) => {
        mutate(false, false);
      })
      .catch();
  }, []);

  //유저 프로필 메뉴 Toggle
  const onClickUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  // 워크스페이스 추가 Modal
  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  // Modal 메뉴 닫기
  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  // 채널 생성
  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  // 사용자 초대 Modal
  const onClickInviteWorkspace = useCallback(() => {}, []);

  // 로그아웃 성공
  if (!userData) {
    return <Link to="/login" />;
  }

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg
              src={gravatar.url(userData.email, { s: '28px', d: 'retro' })}
              alt={userData.nickname}
            />
            {showUserMenu && (
              <Menu
                show={showUserMenu}
                style={{ right: 0, top: 38 }}
                onCloseModal={onClickUserProfile}>
                <ProfileModal>
                  <img
                    src={gravatar.url(userData.email, { s: '36px', d: 'retro' })}
                    alt={userData.nickname}
                  />
                  <div>
                    <span id="profile-name">{userData.nickname}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton>LogOut</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>
      <button onClick={onLogout}>Logout</button>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.url}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>{workspace}</WorkspaceName>
          <MenuScroll>
            <Menu
              show={showWorkspaceModal}
              onCloseModal={toggleWorkspaceModal}
              style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>{workspace}</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>Logout</button>
              </WorkspaceModal>
            </Menu>
            {channelData?.map((channels) => (
              <div key={channels.id}>{channels.name}</div>
            ))}
          </MenuScroll>
        </Channels>
        <Chats>
          <Routes>
            <Route path="/channel/:channel" element={<Channel />} />
            <Route path="/dm/:id" element={<DirectMessage />} />
          </Routes>
        </Chats>
      </WorkspaceWrapper>
      <CreateWorkspaceModal
        show={showCreateWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowCreateWorkspaceModal={setShowCreateWorkspaceModal}
      />
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
        setShowWorkspaceModal={setShowWorkspaceModal}
      />
      <ToastContainer />
    </div>
  );
};

export default Workspace;
