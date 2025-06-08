import React from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';

const Home: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const features = [
    {
      icon: '📊',
      title: '실시간 지출 분석',
      description: '카테고리별, 월별 지출을 한눈에 파악하고 스마트한 인사이트를 받아보세요'
    },
    {
      icon: '📸',
      title: 'AI 영수증 인식',
      description: '영수증을 찍기만 하면 자동으로 금액과 카테고리를 인식해서 등록해드려요'
    },
    {
      icon: '💰',
      title: '스마트 예산 관리',
      description: '카테고리별 예산을 설정하고 실시간으로 지출 현황을 모니터링하세요'
    },
    {
      icon: '🔔',
      title: '지능형 알림',
      description: '예산 초과 위험이나 특별한 지출 패턴을 즉시 알려드려요'
    },
    {
      icon: '📱',
      title: '반응형 디자인',
      description: '모바일, 태블릿, 데스크톱 어디서든 편리하게 사용할 수 있어요'
    },
    {
      icon: '🌙',
      title: '다크 모드',
      description: '눈이 편한 다크 모드와 시스템 설정 자동 감지를 지원해요'
    }
  ];

  const stats = [
    { number: '50,000+', label: '등록된 지출' },
    { number: '2,000+', label: '활성 사용자' },
    { number: '95%', label: 'OCR 정확도' },
    { number: '99.9%', label: '서비스 안정성' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="relative overflow-hidden">
        <nav className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center mr-3">
              <div className="w-4 h-4 bg-white dark:bg-gray-900 rounded-sm"></div>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              ExpenseTracker
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
              title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              로그인
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
            >
              시작하기
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-16 sm:py-24">
            <div className="text-center">
              <div className="mb-8 flex justify-center">
                <div className="rounded-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  AI 영수증 인식으로 간편하게
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl mb-6">
                가계부를 더 쉽게
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
                영수증 사진만 찍으면 자동으로 기록되는 스마트한 가계부. 
                지출 패턴을 분석하고 예산을 관리해보세요.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                >
                  무료로 시작하기
                </Link>
                <Link
                  to="/demo"
                  className="text-gray-600 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-white transition-colors duration-200 flex items-center"
                >
                  데모 보기 
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-500 to-purple-500 opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </header>

      {/* Stats */}
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                신뢰받는 가계부 서비스
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
                수많은 사용자들이 ExpenseTracker로 더 나은 금융 관리를 실현하고 있어요
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex flex-col bg-white dark:bg-gray-800 p-8 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <dt className="text-sm font-semibold leading-6 text-gray-600 dark:text-gray-400">{stat.label}</dt>
                  <dd className="order-first text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {stat.number}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              모든 기능이 하나로
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
              복잡한 가계부는 이제 그만. 간단하고 스마트한 기능들로 누구나 쉽게 사용할 수 있어요.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex flex-col animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-xl">
                      {feature.icon}
                    </div>
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              지금 바로 시작해보세요
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-400">
              가입은 무료이고, 30초면 충분해요. 더 스마트한 가계 관리의 첫걸음을 내딛어보세요.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 px-8 py-4 text-lg font-semibold text-white shadow-xl rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                무료 계정 만들기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-xs leading-5 text-gray-400">
              ExpenseTracker © 2024. AI와 함께하는 스마트한 가계부.
            </p>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2024 ExpenseTracker. 모든 권리 보유.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;