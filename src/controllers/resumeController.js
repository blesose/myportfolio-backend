const path = require('path');
const fs = require('fs');
const ResumeDownload = require('../models/ResumeDownload');
const axios = require('axios');

class ResumeController {
    constructor() {
        // Bind methods to ensure 'this' context
        this.downloadResume = this.downloadResume.bind(this);
        this.trackDownload = this.trackDownload.bind(this);
        this.getDownloadStats = this.getDownloadStats.bind(this);
        this.getResumeInfo = this.getResumeInfo.bind(this);
    }

    // Download resume with tracking
    async downloadResume(req, res) {
        let filePath;
        
        try {
            filePath = path.join(__dirname, '../../public/files/Blessing_Oga_Resume.pdf');
            
            // Debug info
            console.log('📁 Current directory:', __dirname);
            console.log('📁 Full file path:', filePath);
            console.log('📁 File exists:', fs.existsSync(filePath));
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                console.error('❌ Resume file not found at:', filePath);
                return res.status(404).json({
                    success: false,
                    message: 'Resume file not found'
                });
            }

            // Get file stats
            const stats = fs.statSync(filePath);
            
            // Track the download - use arrow function to preserve 'this'
            setTimeout(() => {
                this.trackDownload(req, true).catch(err => 
                    console.error('Error tracking download:', err)
                );
            }, 0);

            // Set headers for file download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="Blessing_Oga_Resume.pdf"');
            res.setHeader('Content-Length', stats.size);
            res.setHeader('Cache-Control', 'no-cache');

            // Stream the file
            const fileStream = fs.createReadStream(filePath);
            fileStream.pipe(res);

            fileStream.on('error', (error) => {
                console.error('❌ Error streaming resume:', error);
                // Track failed download
                setTimeout(() => {
                    this.trackDownload(req, false).catch(err => 
                        console.error('Error tracking failed download:', err)
                    );
                }, 0);
                
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error downloading resume'
                    });
                }
            });

            fileStream.on('end', () => {
                console.log('📄 Resume downloaded successfully');
            });

        } catch (error) {
            console.error('❌ Resume download error:', error);
            
            if (filePath) {
                console.error('❌ Failed to access file:', filePath);
            }
            
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error downloading resume'
                });
            }
        }
    }

    // Track download for analytics
    async trackDownload(req, success = true) {
        try {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];
            
            // Get location from IP (optional - uses free ipapi.co)
            let location = {};
            try {
                // Clean IP address (remove IPv6 prefix if present)
                const cleanIp = ip.replace('::ffff:', '');
                const ipResponse = await axios.get(`http://ipapi.co/${cleanIp}/json/`, { 
                    timeout: 3000
                });
                location = {
                    country: ipResponse.data.country_name,
                    city: ipResponse.data.city,
                    region: ipResponse.data.region
                };
            } catch (locError) {
                // Silently fail location lookup
                console.log('📍 Location lookup skipped');
            }

            // Get source from query parameter
            const source = req.query.source || 'navbar';

            // Save to database
            const download = new ResumeDownload({
                ip: ip,
                userAgent: userAgent,
                location: location,
                source: source,
                success: success
            });

            await download.save();
            console.log(`📊 Download tracked: ${source} - ${success ? 'success' : 'failed'}`);

        } catch (error) {
            console.error('Error saving download tracking:', error.message);
        }
    }

    // Get download stats (protected - admin only)
    async getDownloadStats(req, res) {
        try {
            const { startDate, endDate, source } = req.query;
            
            let query = {};
            
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = new Date(startDate);
                if (endDate) query.timestamp.$lte = new Date(endDate);
            }
            
            if (source) {
                query.source = source;
            }

            const stats = {
                total: await ResumeDownload.countDocuments(query),
                successful: await ResumeDownload.countDocuments({ ...query, success: true }),
                failed: await ResumeDownload.countDocuments({ ...query, success: false }),
                bySource: await ResumeDownload.aggregate([
                    { $match: query },
                    { $group: { _id: "$source", count: { $sum: 1 } } }
                ]),
                byDay: await ResumeDownload.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { _id: -1 } },
                    { $limit: 30 }
                ]),
                recent: await ResumeDownload.find(query)
                    .sort({ timestamp: -1 })
                    .limit(10)
            };

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error getting download stats:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving download statistics'
            });
        }
    }

    // Get resume info (public)
    async getResumeInfo(req, res) {
        try {
            const filePath = path.join(__dirname, '../../public/files/Blessing_Oga_Resume.pdf');
            
            if (!fs.existsSync(filePath)) {
                return res.json({
                    success: false,
                    message: 'Resume not available',
                    available: false
                });
            }

            const stats = fs.statSync(filePath);
            
            // Get download count
            const downloadCount = await ResumeDownload.countDocuments({ success: true });
            
            res.json({
                success: true,
                data: {
                    filename: 'Blessing_Oga_Resume.pdf',
                    size: stats.size,
                    lastModified: stats.mtime,
                    available: true,
                    downloadCount: downloadCount
                }
            });

        } catch (error) {
            console.error('Error getting resume info:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving resume information'
            });
        }
    }
}

// Create instance
const resumeController = new ResumeController();

// Export the instance with methods bound
module.exports = resumeController;