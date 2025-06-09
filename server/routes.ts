// Feedback routes
  app.get('/api/feedback', async (req, res) => {
    try {
      const feedbacks = await db.all(`
        SELECT * FROM feedback 
        ORDER BY submittedAt DESC
      `);
      res.json(feedbacks);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  app.post('/api/feedback', async (req, res) => {
    try {
      const { name, phone, email, stage, membershipStatus, type, message, submittedAt, status } = req.body;

      const result = await db.run(`
        INSERT INTO feedback (name, phone, email, stage, membershipStatus, type, message, submittedAt, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name || null, phone || null, email || null, stage, membershipStatus, type, message, submittedAt, status || 'pending']);

      res.json({ id: result.lastID, ...req.body });
    } catch (error) {
      console.error('Error creating feedback:', error);
      res.status(500).json({ error: 'Failed to create feedback' });
    }
  });

  app.put('/api/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await db.run(`
        UPDATE feedback 
        SET status = ?
        WHERE id = ?
      `, [status, id]);

      res.json({ success: true });
    } catch (error) {
      console.error('Error updating feedback:', error);
      res.status(500).json({ error: 'Failed to update feedback' });
    }
  });

  app.delete('/api/feedback/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM feedback WHERE id = ?', [id]);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      res.status(500).json({ error: 'Failed to delete feedback' });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', async (req, res) => {