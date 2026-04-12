import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { MenopauseProfile } from './entities/menopause-profile.entity';
import { MenopauseLog } from './entities/menopause-log.entity';
import { CreateMenopauseProfileDto } from './dto/create-menopause-profile.dto';
import { CreateMenopauseLogDto } from './dto/create-menopause-log.dto';

@Injectable()
export class MenopauseService {
  constructor(
    @InjectRepository(MenopauseProfile)
    private readonly profileRepo: Repository<MenopauseProfile>,
    @InjectRepository(MenopauseLog)
    private readonly logRepo: Repository<MenopauseLog>,
  ) {}

  createProfile(userId: string, dto: CreateMenopauseProfileDto) {
    const profile = this.profileRepo.create({
      userId,
      stage: dto.stage,
      ageAtOnset: dto.ageAtOnset ?? null,
      onHRT: dto.onHRT ?? false,
      symptoms: dto.symptoms ?? null,
    });
    return this.profileRepo.save(profile);
  }

  async getProfile(userId: string) {
    const profile = await this.profileRepo.findOne({ where: { userId } });
    if (!profile) throw new NotFoundException('Menopause profile not found');
    return profile;
  }

  logDay(userId: string, dto: CreateMenopauseLogDto) {
    const log = this.logRepo.create({
      userId,
      date: new Date(dto.date),
      hotFlashCount: dto.hotFlashCount ?? null,
      hotFlashIntensity: dto.hotFlashIntensity ?? null,
      sleepQuality: dto.sleepQuality ?? null,
      moodScore: dto.moodScore ?? null,
      vaginalDryness: dto.vaginalDryness ?? false,
      jointPain: dto.jointPain ?? false,
      nightSweats: dto.nightSweats ?? false,
      notes: dto.notes ?? null,
    });
    return this.logRepo.save(log);
  }

  getLogs(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.logRepo.find({
      where: { userId, date: MoreThanOrEqual(thirtyDaysAgo) },
      order: { date: 'DESC' },
    });
  }

  async calculateMRS(userId: string) {
    const logs = await this.getLogs(userId);
    if (logs.length === 0) {
      return { score: 0, severity: 'no data', details: {} };
    }

    // Simplified MRS calculation based on recent symptom averages
    // Somatic subscale: hot flashes, joint pain, night sweats
    // Psychological subscale: mood
    // Urogenital subscale: vaginal dryness
    const avgHotFlashIntensity =
      logs.reduce((sum, l) => sum + (l.hotFlashIntensity ?? 0), 0) / logs.length;
    const avgMood =
      logs.reduce((sum, l) => sum + (l.moodScore ?? 3), 0) / logs.length;
    const avgSleep =
      logs.reduce((sum, l) => sum + (l.sleepQuality ?? 3), 0) / logs.length;
    const jointPainRate =
      logs.filter((l) => l.jointPain).length / logs.length;
    const nightSweatRate =
      logs.filter((l) => l.nightSweats).length / logs.length;
    const vaginalDrynessRate =
      logs.filter((l) => l.vaginalDryness).length / logs.length;

    // Score 0-44 (simplified)
    const somatic = Math.round(
      avgHotFlashIntensity + nightSweatRate * 4 + jointPainRate * 4,
    );
    const psychological = Math.round((5 - avgMood) + (5 - avgSleep));
    const urogenital = Math.round(vaginalDrynessRate * 4);
    const totalScore = somatic + psychological + urogenital;

    let severity: string;
    if (totalScore <= 4) severity = 'minimal';
    else if (totalScore <= 8) severity = 'mild';
    else if (totalScore <= 16) severity = 'moderate';
    else severity = 'severe';

    // Update profile with latest MRS score
    const profile = await this.profileRepo.findOne({
      where: { userId },
    });
    if (profile) {
      profile.mrsScore = totalScore;
      await this.profileRepo.save(profile);
    }

    return {
      score: totalScore,
      severity,
      details: {
        somatic,
        psychological,
        urogenital,
      },
      basedOnLogs: logs.length,
    };
  }

  getRecommendations(stage: string) {
    const recommendations: Record<
      string,
      { exercise: string[]; nutrition: string[]; lifestyle: string[]; reference: string }
    > = {
      perimenopause: {
        exercise: [
          'Strength training 3x/week to preserve bone density',
          'High-intensity interval training (HIIT) 2x/week',
          'Flexibility and mobility work daily',
          'Pelvic floor exercises',
        ],
        nutrition: [
          'Calcium 1200mg/day (food + supplement)',
          'Vitamin D 600-1000 IU/day',
          'Phytoestrogen-rich foods (soy, flaxseed)',
          'Reduce caffeine and alcohol to manage hot flashes',
          'Anti-inflammatory diet rich in omega-3',
        ],
        lifestyle: [
          'Stress reduction techniques (meditation, yoga)',
          'Sleep hygiene optimization',
          'Regular health screenings',
        ],
        reference: 'International Menopause Society (IMS) 2024 Recommendations',
      },
      menopause: {
        exercise: [
          'Weight-bearing exercises for bone health',
          'Balance training to prevent falls',
          'Moderate cardio 150 min/week',
          'Resistance training with progressive overload',
        ],
        nutrition: [
          'Calcium 1200mg/day',
          'Vitamin D 800-1000 IU/day',
          'Anti-inflammatory diet (Mediterranean pattern)',
          'Adequate protein (1.2g/kg/day) for muscle preservation',
          'Limit sodium for cardiovascular health',
        ],
        lifestyle: [
          'Cognitive activities to support brain health',
          'Social connections and community engagement',
          'Regular bone density and cardiovascular screening',
        ],
        reference: 'International Menopause Society (IMS) 2024 Recommendations',
      },
      postmenopause: {
        exercise: [
          'Fall prevention exercises (balance, coordination)',
          'Flexibility and stretching daily',
          'Low-impact weight-bearing exercise',
          'Walking 30+ minutes daily',
          'Tai chi or gentle yoga for balance',
        ],
        nutrition: [
          'Calcium 1200mg/day with vitamin D',
          'High-fiber diet for digestive and cardiovascular health',
          'Adequate hydration',
          'Vitamin B12 monitoring and supplementation',
        ],
        lifestyle: [
          'Social activity and group exercise',
          'Mental health check-ins',
          'Annual comprehensive health screenings',
          'Pelvic health maintenance',
        ],
        reference: 'International Menopause Society (IMS) 2024 Recommendations',
      },
    };

    return (
      recommendations[stage] ??
      recommendations['perimenopause']
    );
  }
}
