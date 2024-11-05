import { ResearchAgent } from '../agents/ResearchAgent.js';
import { Auth0Specialist } from '../agents/auth0Specialist.js';
import { OutreachAgent } from '../agents/OutreachAgent.js';
import { QualityCheckService } from '../services/qualityCheck.js';
import { ErrorHandler } from '../utils/errorHandler.js';
import { LinkedInTransformer } from '../utils/linkedInTransformer.js';

export class OutreachCrew {
  constructor() {
    this.researcher = new ResearchAgent();
    this.specialist = new Auth0Specialist();
    this.outreachAgent = new OutreachAgent();
    this.qualityCheck = new QualityCheckService();
    
    this.metrics = {
      processedLeads: 0,
      successfulOutreach: 0,
      failedOutreach: 0,
      averageQualityScore: 0,
      processingTime: []
    };
  }

  async processLeads(data) {
    const results = [];
    const startTime = Date.now();
    
    console.log('Starting execution for', data.leads.length, 'leads');

    try {
      // Process leads in parallel with rate limiting
      const batchSize = 5;
      for (let i = 0; i < data.leads.length; i += batchSize) {
        const batch = data.leads.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(lead => this.processLead(lead))
        );
        results.push(...batchResults);

        // Rate limiting pause between batches
        if (i + batchSize < data.leads.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update metrics
      this.updateMetrics(results, startTime);

      // Generate execution report
      const report = this.generateExecutionReport(results, startTime);
      console.log('\nExecution Report:', report);

      return {
        results,
        report
      };

    } catch (error) {
      throw ErrorHandler.handle(error, {
        phase: 'crew_execution',
        leadsCount: data.leads.length
      });
    }
  }

  async processLead(lead) {
    const leadStartTime = Date.now();
    console.log(`\nProcessing lead:`, lead.company);

    try {
      // Phase 1: Research
      console.log('Starting research phase...');
      const research = await this.researcher.analyze(lead);
      console.log('Research completed');

      // Validate research data
      this.validateResearchData(research);

      // Phase 2: Solution Analysis
      console.log('Starting solution analysis...');
      const solution = await this.specialist.analyzeSolution(research);
      console.log('Solution analysis completed');

      // Validate solution data
      this.validateSolutionData(solution);

      // Phase 3: Create Outreach Campaign
      console.log('Creating outreach campaign...');
      const outreach = await this.outreachAgent.createCampaign(research, solution);
      console.log('Outreach campaign created');

      // Phase 4: Quality Check
      console.log('Performing quality check...');
      const qualityScore = this.qualityCheck.checkPersonalization(outreach, research);
      console.log('Quality score:', qualityScore.score);

      // Handle low quality scores
      if (qualityScore.score < 0.7) {
        console.warn('Quality check suggestions:', qualityScore.suggestions);
        
        // Attempt to improve if score is too low
        if (qualityScore.score < 0.5) {
          console.log('Attempting to improve outreach quality...');
          return await this.improveOutreachQuality(lead, research, solution, qualityScore);
        }
      }

      const processingTime = Date.now() - leadStartTime;
      
      return {
        lead,
        research,
        solution,
        outreach,
        qualityScore,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          status: 'success'
        }
      };

    } catch (error) {
      console.error(`Error processing lead ${lead.company}:`, error);
      return {
        lead,
        error: error.message,
        metadata: {
          processingTime: Date.now() - leadStartTime,
          timestamp: new Date().toISOString(),
          status: 'error'
        }
      };
    }
  }

  validateResearchData(research) {
    const requiredFields = [
      'companyInfo',
      'contactInfo',
      'techStack',
      'securityNeeds',
      'recentNews'
    ];

    requiredFields.forEach(field => {
      if (!research[field]) {
        throw new Error(`Missing required research field: ${field}`);
      }
    });
  }

  validateSolutionData(solution) {
    const requiredFields = [
      'analysis.executiveSummary',
      'analysis.securityAssessment',
      'analysis.proposedSolution',
      'analysis.implementationStrategy',
      'analysis.roi'
    ];

    requiredFields.forEach(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], solution);
      if (!value) {
        throw new Error(`Missing required solution field: ${field}`);
      }
    });
  }

  async improveOutreachQuality(lead, research, solution, qualityScore) {
    console.log('Improving outreach quality for:', lead.company);

    // Enhance research with additional data points
    const enhancedResearch = await this.researcher.analyze({
      ...lead,
      priority: 'High' // Force high priority for deeper research
    });

    // Get more detailed solution analysis
    const enhancedSolution = await this.specialist.analyzeSolution(enhancedResearch);

    // Create new outreach with enhanced data
    const improvedOutreach = await this.outreachAgent.createCampaign(
      enhancedResearch,
      enhancedSolution
    );

    // Check quality again
    const newQualityScore = this.qualityCheck.checkPersonalization(
      improvedOutreach,
      enhancedResearch
    );

    console.log('Improved quality score:', newQualityScore.score);

    return {
      lead,
      research: enhancedResearch,
      solution: enhancedSolution,
      outreach: improvedOutreach,
      qualityScore: newQualityScore,
      metadata: {
        processingTime: Date.now(),
        timestamp: new Date().toISOString(),
        status: 'success',
        improved: true,
        originalScore: qualityScore.score,
        improvementDelta: newQualityScore.score - qualityScore.score
      }
    };
  }

  updateMetrics(results, startTime) {
    this.metrics.processedLeads += results.length;
    this.metrics.successfulOutreach += results.filter(r => r.metadata?.status === 'success').length;
    this.metrics.failedOutreach += results.filter(r => r.metadata?.status === 'error').length;
    
    const qualityScores = results
      .filter(r => r.qualityScore?.score)
      .map(r => r.qualityScore.score);
    
    this.metrics.averageQualityScore = qualityScores.length > 0
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
      : 0;

    this.metrics.processingTime.push(Date.now() - startTime);
  }

  generateExecutionReport(results, startTime) {
    const successfulResults = results.filter(r => r.metadata?.status === 'success');
    const failedResults = results.filter(r => r.metadata?.status === 'error');
    const improvedResults = results.filter(r => r.metadata?.improved);

    const totalTime = Date.now() - startTime;
    const averageTimePerLead = totalTime / results.length;

    return {
      summary: {
        totalLeads: results.length,
        successful: successfulResults.length,
        failed: failedResults.length,
        improved: improvedResults.length,
        averageQualityScore: this.metrics.averageQualityScore
      },
      timing: {
        totalExecutionTime: totalTime,
        averageTimePerLead: averageTimePerLead
      },
      qualityMetrics: {
        highQualityOutreach: results.filter(r => r.qualityScore?.score >= 0.8).length,
        mediumQualityOutreach: results.filter(r => r.qualityScore?.score >= 0.5 && r.qualityScore?.score < 0.8).length,
        lowQualityOutreach: results.filter(r => r.qualityScore?.score < 0.5).length
      },
      improvements: {
        totalImprovements: improvedResults.length,
        averageScoreImprovement: improvedResults.length > 0
          ? improvedResults.reduce((acc, r) => acc + r.metadata.improvementDelta, 0) / improvedResults.length
          : 0
      }
    };
  }
}
