import React from "react";
import { Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
export function QuickActions() { return <Card><CardContent><Typography variant="h6" sx={{ mb: 1 }}>Quick actions</Typography><Grid container spacing={1}><Grid item xs={12} sm={4}><Button fullWidth component={Link} to="/send" variant="contained">Send tokens</Button></Grid><Grid item xs={12} sm={4}><Button fullWidth component={Link} to="/receive" variant="outlined">Receive</Button></Grid><Grid item xs={12} sm={4}><Button fullWidth component={Link} to="/trade" variant="outlined">Swap</Button></Grid></Grid></CardContent></Card>; }
