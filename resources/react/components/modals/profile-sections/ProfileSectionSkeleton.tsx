/**
 * ProfileSectionSkeleton - Скелетон для загрузки подразделов профиля
 */

import React from 'react';

interface ProfileSectionSkeletonProps {
    hasBackButton?: boolean;
}

const ProfileSectionSkeleton: React.FC<ProfileSectionSkeletonProps> = ({ hasBackButton = true }) => {
    return (
        <div className="profile-section-container">
            {/* Шапка */}
            <div className="profile-modal-header">
                {hasBackButton && (
                    <div className="profile-section-skeleton-back"></div>
                )}
                <div className="profile-section-skeleton-title"></div>
                <div style={{ width: '35px' }}></div>
            </div>

            {/* Контент */}
            <div className="profile-section-content">
                <div className="profile-section-skeleton-content">
                    <div className="profile-section-skeleton-block"></div>
                    <div className="profile-section-skeleton-block"></div>
                    <div className="profile-section-skeleton-block"></div>
                    <div className="profile-section-skeleton-block"></div>
                    <div className="profile-section-skeleton-block profile-section-skeleton-block-small"></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSectionSkeleton;

