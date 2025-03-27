import Head from 'next/head';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  CircularProgress,
  Alert
} from '@mui/material';
import { AddRounded } from '@mui/icons-material';

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
};

export type Customers = Customer[];

export type ApiError = {
  code: string;
  message: string;
};

const Home = () => {
  // State for dialog
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: ''
  });

  // SWR for data fetching
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    const body = await response.json();
    if (!response.ok) throw body;
    return body;
  };
  
  const { data, error, isLoading } = useSWR<Customers, ApiError>(
    '/api/customers',
    fetcher
  );

  // Handler for form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
  };

  // Handler for form submission
  const handleSubmit = async () => {
    setSubmitError(null);
    
    // Validation
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add customer');
      }

      setNewCustomer({ firstName: '', lastName: '', email: '' });
      mutate('/api/customers');
      
     
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to display name
  const displayName = (customer: Customer) => {
    return `${customer.firstName} ${customer.lastName}`;
  };

  // Modal close handler
  const handleClose = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setSubmitError(null);
    }
  };

  return (
    <>
      <Head>
        <title>Dwolla | Customers</title>
      </Head>
      <main>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper sx={{ 
            p: 2, 
            borderRadius: 1,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Header with customer count and add button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
                {data ? `${data.length} Customers` : 'Customers'}
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddRounded />}
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                sx={{ 
                  bgcolor: '#1A1A1A', 
                  '&:hover': { bgcolor: '#333' },
                  borderRadius: 1,
                  textTransform: 'none',
                  px: 2
                }}
              >
                Add Customer
              </Button>
            </Box>

            {/* Error display for data fetching */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.message}
              </Alert>
            )}

            {/* Customer table */}
            <TableContainer sx={{ border: '1px solid #E0E0E0', borderRadius: 1 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 500, bgcolor: 'white' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 500, bgcolor: 'white' }}>Email</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        Loading customers...
                      </TableCell>
                    </TableRow>
                  ) : data && data.length > 0 ? (
                    data.map((customer, index) => (
                      <TableRow key={index} sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 }
                      }}>
                        <TableCell>{displayName(customer)}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                        No customers found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Add Customer Dialog */}
          <Dialog 
            open={isModalOpen} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ pt: 3, pb: 1 }}>
              Add Customer
            </DialogTitle>
            <DialogContent>
              {submitError && (
                <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
                  {submitError}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
                <TextField
                  name="firstName"
                  label="First Name"
                  value={newCustomer.firstName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  size="small"
                  placeholder="First Name *"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={newCustomer.lastName}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  size="small"
                  placeholder="Last Name *"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              
              <TextField
                name="email"
                label="Email Address"
                type="email"
                value={newCustomer.email}
                onChange={handleInputChange}
                fullWidth
                required
                size="small"
                placeholder="Email Address *"
                InputLabelProps={{ shrink: true }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={handleClose} 
                disabled={isSubmitting}
                sx={{ color: 'text.primary' }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                sx={{ 
                  bgcolor: '#1A1A1A', 
                  '&:hover': { bgcolor: '#333' }
                }}
              >
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </main>
    </>
  );
};

export default Home;