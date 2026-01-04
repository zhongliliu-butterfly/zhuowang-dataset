'use client';

import { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress, Stack, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/home/HeroSection';
import StatsCard from '@/components/home/StatsCard';
import ProjectList from '@/components/home/ProjectList';
import CreateProjectDialog from '@/components/home/CreateProjectDialog';
import MigrationDialog from '@/components/home/MigrationDialog';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useAtom } from 'jotai';
import { loginStateAtom } from '@/lib/store';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [unmigratedProjects, setUnmigratedProjects] = useState([]);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [loginState] = useAtom(loginStateAtom);
  const router = useRouter();
  const [isLoginStateLoaded, setIsLoginStateLoaded] = useState(false);

  useEffect(() => {
    // 检查登录状态是否加载完成
    if (!isLoginStateLoaded) {
      setIsLoginStateLoaded(true);
      return;
    }

    if (loginState.isLoggedIn === undefined) {
      return; // 等待登录状态加载完成
    }

    if (!loginState.isLoggedIn) {
      router.replace('/login'); // 使用 replace 避免记录跳转历史
      return;
    }

    async function fetchProjects() {
      try {
        setLoading(true);
        // 获取用户创建的项目详情
        const response = await fetch(`/api/projects`);

        if (!response.ok) {
          throw new Error(t('projects.fetchFailed'));
        }

        const data = await response.json();
        setProjects(data);

        // 检查是否有未迁移的项目
        await checkUnmigratedProjects();
      } catch (error) {
        console.error(t('projects.fetchError'), String(error));
        setError(String(error));
      } finally {
        setLoading(false);
      }
    }

    // 检查未迁移的项目
    async function checkUnmigratedProjects() {
      try {
        const response = await fetch('/api/projects/unmigrated');

        if (!response.ok) {
          console.error('检查未迁移项目失败');
          return;
        }

        const { success, data } = await response.json();

        if (success && Array.isArray(data) && data.length > 0) {
          setUnmigratedProjects(data);
          setMigrationDialogOpen(true);
        }
      } catch (error) {
        console.error('检查未迁移项目出错', error);
      }
    }

    fetchProjects();
  }, [isLoginStateLoaded, loginState.isLoggedIn, router]);

  const theme = useTheme();

  if (!isLoginStateLoaded || loginState.isLoggedIn === undefined) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: theme.palette.background.default
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!loginState.isLoggedIn) {
    return null; // 确保未登录时不渲染任何内容
  }

  return (
    <main style={{ overflow: 'hidden', position: 'relative' }}>
      <Navbar projects={projects} />

      <HeroSection onCreateProject={() => setCreateDialogOpen(true)} />

      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 6, md: 8 },
          mb: { xs: 4, md: 6 },
          position: 'relative',
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            display: 'none' // 隐藏 Webkit 浏览器的滚动条
          },
          scrollbarWidth: 'none' // 隐藏 Firefox 浏览器的滚动条
        }}
      >
        {/* <StatsCard projects={projects} /> */}

        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              mt: 6,
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress size={40} thickness={4} />
            <Typography variant="body2" color="text.secondary">
              {t('projects.loading')}
            </Typography>
          </Box>
        )}

        {error && !loading && (
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            sx={{
              mt: 4,
              p: 3,
              bgcolor: 'error.light',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ErrorOutlineIcon color="error" />
              <Typography color="error.dark">
                {t('projects.fetchFailed')}: {error}
              </Typography>
            </Stack>
          </Box>
        )}

        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ProjectList projects={projects} onCreateProject={() => setCreateDialogOpen(true)} />
          </motion.div>
        )}
      </Container>

      <CreateProjectDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />

      {/* 项目迁移对话框 */}
      <MigrationDialog
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        projectIds={unmigratedProjects}
      />
    </main>
  );
}