import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cycleApi, CurrentPhase } from '../../services/cycle.api';
import { feedApi, FeedPost } from '../../services/feed.api';
import { contentApi, Article } from '../../services/content.api';
import { StoryGroup } from '../../services/stories.api';
import StoriesBar from '../../components/StoriesBar';
import StoryViewer from '../../components/StoryViewer';
import HomeHeader from './HomeHeader';
import PhaseCard from './PhaseCard';
import WorkoutCard from './WorkoutCard';
import FeedPreview from './FeedPreview';
import ContentCarousel from './ContentCarousel';
import HomeTabBar from './HomeTabBar';

export default function Home() {
  const { currentUser } = useAuth();
  const [phase, setPhase] = useState<CurrentPhase | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [storyGroup, setStoryGroup] = useState<StoryGroup | null>(null);

  useEffect(() => {
    const load = async () => {
      const [phaseRes, feedRes] = await Promise.all([
        cycleApi.current().catch(() => null),
        feedApi.getFeed(undefined, 3).catch(() => ({ data: [], nextCursor: null })),
      ]);

      setPhase(phaseRes);
      setFeedPosts(feedRes.data);

      const articlePhase = phaseRes?.phase ?? undefined;
      const contentRes = await contentApi
        .listArticles({ phase: articlePhase, page: 1 })
        .catch(() => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }));
      setArticles(contentRes.data.slice(0, 5));
    };

    load();
  }, []);

  return (
    <div className="home-screen">
      <div className="home-scroll">
        <HomeHeader user={currentUser} phase={phase} />
        <div className="home-content">
          <StoriesBar onOpenStory={setStoryGroup} onCreateStory={() => {}} />
          {storyGroup && (
            <StoryViewer group={storyGroup} onClose={() => setStoryGroup(null)} />
          )}
          <PhaseCard phase={phase} />
          <WorkoutCard />
          <FeedPreview posts={feedPosts} />
          <ContentCarousel articles={articles} phase={phase?.phase} />
        </div>
      </div>
      <HomeTabBar />
    </div>
  );
}
