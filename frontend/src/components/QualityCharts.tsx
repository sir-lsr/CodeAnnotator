import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import type { ProjectQualityMetrics } from '../types';

const { Title, Text } = Typography;

interface QualityChartsProps {
  projectQuality: ProjectQualityMetrics;
}

const QualityCharts: React.FC<QualityChartsProps> = ({ projectQuality }) => {
  // 计算标注类型分布的百分比
  const totalAnnotations = projectQuality.total_annotations;
  const infoPercent = totalAnnotations > 0 ? (projectQuality.info_count / totalAnnotations) * 100 : 0;
  const warningPercent = totalAnnotations > 0 ? (projectQuality.warning_count / totalAnnotations) * 100 : 0;
  const suggestionPercent = totalAnnotations > 0 ? (projectQuality.suggestion_count / totalAnnotations) * 100 : 0;
  const securityPercent = totalAnnotations > 0 ? (projectQuality.security_count / totalAnnotations) * 100 : 0;

  // 计算审核状态分布的百分比
  const totalReviewed = projectQuality.pending_count + projectQuality.approved_count + projectQuality.rejected_count;
  const pendingPercent = totalReviewed > 0 ? (projectQuality.pending_count / totalReviewed) * 100 : 0;
  const approvedPercent = totalReviewed > 0 ? (projectQuality.approved_count / totalReviewed) * 100 : 0;
  const rejectedPercent = totalReviewed > 0 ? (projectQuality.rejected_count / totalReviewed) * 100 : 0;

  return (
    <Row gutter={[16, 16]}>
      {/* 标注类型分布饼图 */}
      <Col xs={24} lg={12}>
        <Card title="标注类型分布" bordered={false}>
          <div style={{ padding: '20px 0' }}>
            {/* 饼图 SVG */}
            <svg width="100%" height="250" viewBox="0 0 300 300" style={{ maxWidth: '300px', margin: '0 auto', display: 'block' }}>
              <circle cx="150" cy="150" r="100" fill="none" stroke="#f0f0f0" strokeWidth="60" />
              
              {/* 信息 - 蓝色 */}
              <circle
                cx="150"
                cy="150"
                r="100"
                fill="none"
                stroke="#1890ff"
                strokeWidth="60"
                strokeDasharray={`${infoPercent * 6.28} 628`}
                strokeDashoffset="0"
                transform="rotate(-90 150 150)"
              />
              
              {/* 警告 - 橙色 */}
              <circle
                cx="150"
                cy="150"
                r="100"
                fill="none"
                stroke="#faad14"
                strokeWidth="60"
                strokeDasharray={`${warningPercent * 6.28} 628`}
                strokeDashoffset={`-${infoPercent * 6.28}`}
                transform="rotate(-90 150 150)"
              />
              
              {/* 建议 - 绿色 */}
              <circle
                cx="150"
                cy="150"
                r="100"
                fill="none"
                stroke="#52c41a"
                strokeWidth="60"
                strokeDasharray={`${suggestionPercent * 6.28} 628`}
                strokeDashoffset={`-${(infoPercent + warningPercent) * 6.28}`}
                transform="rotate(-90 150 150)"
              />
              
              {/* 安全 - 红色 */}
              <circle
                cx="150"
                cy="150"
                r="100"
                fill="none"
                stroke="#f5222d"
                strokeWidth="60"
                strokeDasharray={`${securityPercent * 6.28} 628`}
                strokeDashoffset={`-${(infoPercent + warningPercent + suggestionPercent) * 6.28}`}
                transform="rotate(-90 150 150)"
              />
              
              {/* 中心文字 */}
              <text x="150" y="140" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#333">
                {totalAnnotations}
              </text>
              <text x="150" y="165" textAnchor="middle" fontSize="14" fill="#999">
                总标注数
              </text>
            </svg>

            {/* 图例 */}
            <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#1890ff', borderRadius: '50%' }} />
                <Text>信息 ({projectQuality.info_count})</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#faad14', borderRadius: '50%' }} />
                <Text>警告 ({projectQuality.warning_count})</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#52c41a', borderRadius: '50%' }} />
                <Text>建议 ({projectQuality.suggestion_count})</Text>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 12, backgroundColor: '#f5222d', borderRadius: '50%' }} />
                <Text>安全 ({projectQuality.security_count})</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>

      {/* 审核状态分布条形图 */}
      <Col xs={24} lg={12}>
        <Card title="审核状态分布" bordered={false}>
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>待审核</Text>
                <Text strong>{projectQuality.pending_count} ({pendingPercent.toFixed(1)}%)</Text>
              </div>
              <div style={{ width: '100%', height: 24, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${pendingPercent}%`,
                    height: '100%',
                    backgroundColor: '#faad14',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>已通过</Text>
                <Text strong>{projectQuality.approved_count} ({approvedPercent.toFixed(1)}%)</Text>
              </div>
              <div style={{ width: '100%', height: 24, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${approvedPercent}%`,
                    height: '100%',
                    backgroundColor: '#52c41a',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text>已拒绝</Text>
                <Text strong>{projectQuality.rejected_count} ({rejectedPercent.toFixed(1)}%)</Text>
              </div>
              <div style={{ width: '100%', height: 24, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${rejectedPercent}%`,
                    height: '100%',
                    backgroundColor: '#f5222d',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </Col>

      {/* 文件质量分布柱状图 */}
      <Col xs={24}>
        <Card title="文件质量分布" bordered={false}>
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 200, gap: '24px' }}>
              {/* 高质量文件 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 150 }}>
                  <div
                    style={{
                      width: '80%',
                      maxWidth: 120,
                      height: `${(projectQuality.file_metrics.filter(f => f.quality_score >= 80).length / projectQuality.total_files) * 100}%`,
                      minHeight: 20,
                      backgroundColor: '#52c41a',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: 8,
                    }}
                  >
                    <Text strong style={{ color: '#fff', fontSize: 16 }}>
                      {projectQuality.file_metrics.filter(f => f.quality_score >= 80).length}
                    </Text>
                  </div>
                </div>
                <Text style={{ marginTop: 8 }}>高质量 (≥80分)</Text>
              </div>

              {/* 中等质量文件 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 150 }}>
                  <div
                    style={{
                      width: '80%',
                      maxWidth: 120,
                      height: `${(projectQuality.file_metrics.filter(f => f.quality_score >= 60 && f.quality_score < 80).length / projectQuality.total_files) * 100}%`,
                      minHeight: 20,
                      backgroundColor: '#faad14',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: 8,
                    }}
                  >
                    <Text strong style={{ color: '#fff', fontSize: 16 }}>
                      {projectQuality.file_metrics.filter(f => f.quality_score >= 60 && f.quality_score < 80).length}
                    </Text>
                  </div>
                </div>
                <Text style={{ marginTop: 8 }}>中等质量 (60-80分)</Text>
              </div>

              {/* 低质量文件 */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 150 }}>
                  <div
                    style={{
                      width: '80%',
                      maxWidth: 120,
                      height: `${(projectQuality.file_metrics.filter(f => f.quality_score < 60).length / projectQuality.total_files) * 100}%`,
                      minHeight: 20,
                      backgroundColor: '#f5222d',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      paddingTop: 8,
                    }}
                  >
                    <Text strong style={{ color: '#fff', fontSize: 16 }}>
                      {projectQuality.file_metrics.filter(f => f.quality_score < 60).length}
                    </Text>
                  </div>
                </div>
                <Text style={{ marginTop: 8 }}>低质量 (&lt;60分)</Text>
              </div>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default QualityCharts;

