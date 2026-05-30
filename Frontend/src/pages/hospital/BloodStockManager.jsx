import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2, Save, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import Skeleton from '../../components/ui/Skeleton'
import hospitalService from '../../services/hospitalService'
import { toast, Toaster } from 'react-hot-toast'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const BloodStockManager = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [hospitalId, setHospitalId] = useState(null);
  useEffect(() => {
    fetchBloodStock();
    fetchHospitalProfile();
  }, []);

  const fetchBloodStock = async () => {
    setIsLoading(true)
    try {
      const response = await hospitalService.getBloodStock();
      const data = (response.data && response.data.data) || response.data || [];
      setStock(data);
    } catch (err) {
      console.error(err)
      toast.error('Failed to load blood stock')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditValues({
      [item._id]: item.availableUnits,
    });
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const handleSave = async (id, bloodGroup) => {
    setIsSaving(true)
    try {
      const newUnits = parseInt(editValues[id]) || 0
      await hospitalService.updateBloodStock(bloodGroup, newUnits)
      toast.success(`${bloodGroup} stock updated to ${newUnits} units`)
      fetchBloodStock()
      setEditingId(null)
      setEditValues({})
    } catch (err) {
      console.error(err)
      toast.error('Failed to update stock')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddBloodGroup = async (bg) => {
    try {
      console.log('Attempting to add blood group:', bg);
      toast(`Adding ${bg}...`);
      await hospitalService.upsertBloodStock(bg, 0);
      toast.success(`Added ${bg} to stock`);
      fetchBloodStock();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || 'Failed to add blood group';
      toast.error(msg);
    }
  }

  const handleDelete = async (bloodGroup) => {
    if (window.confirm(`Remove ${bloodGroup} from inventory?`)) {
      try {
        await hospitalService.deleteBloodStock(bloodGroup);
        toast.success(`${bloodGroup} removed from stock`);
        fetchBloodStock();
      } catch (err) {
        console.error(err)
        toast.error('Failed to remove stock')
      }
    }
  }

  const getStatusColor = (units) => {
    if (units === 0) return 'critical'
    if (units < 5) return 'warning'
    return 'success'
  }

  const getStatusLabel = (units) => {
    if (units === 0) return 'Critical'
    if (units < 5) return 'Low'
    return 'Good'
  }

  const totalUnits = stock.reduce((sum, item) => sum + (item.availableUnits || 0), 0);
  const fetchHospitalProfile = async () => {
    try {
      const profile = await hospitalService.getProfile();
      setHospitalId(profile._id || profile.id || null);
    } catch (e) {
      console.error('Failed to fetch hospital profile', e);
    }
  };

  return (
    <DashboardLayout title="Blood Stock Manager"><Toaster position="top-right"/>
      <div className="space-y-6">
        {/* Summary Card */}
        <Card className="bg-gradient-to-r from-blood/10 to-blood-dark/10 border border-blood/30">
          <div className="p-6 space-y-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Total Stock</h3>
            <div className="flex items-end gap-4">
              <div>
                <p className="text-5xl font-bold text-blood">{totalUnits}</p>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider">Units Total</p>
              </div>
              <div className="text-sm text-text-muted">
                {stock.length} blood group{stock.length !== 1 ? 's' : ''} managed
              </div>
            </div>
          </div>
        </Card>

        {/* Stock Table */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">Manage Inventory</h3>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} variant="line" className="h-16" />
                ))}
              </div>
            ) : stock.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-muted">No blood stock records. Start by adding a blood group below.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Blood Group</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Available Units</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Status</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Last Updated</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bloodGroups.map((bg, idx) => {
                      const item = stock.find(s => s.bloodGroup === bg);
                      const isExisting = !!item;
                      const statusColor = getStatusColor(item?.availableUnits ?? 0);
                      const isEditing = editingId === (item ? item._id : null);
                      const rowKey = item ? item._id : `placeholder-${bg}`;
                      const availableUnits = item?.availableUnits ?? 0;
                      const lastUpdated = item?.lastUpdated ?? null;
                      return (
                        <motion.tr
                          key={rowKey}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-b border-border/30 hover:bg-surface-3/50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <BloodGroupBadge group={bg} size="sm" />
                          </td>
                          <td className="py-4 px-4">
                            {isExisting && isEditing ? (
                              <input
                                type="number"
                                min="0"
                                value={editValues[item._id] || ''}
                                onChange={(e) =>
                                  setEditValues({
                                    ...editValues,
                                    [item._id]: e.target.value,
                                  })
                                }
                                className="w-16 px-2 py-1 rounded bg-surface-3 border border-border/50 text-text-primary text-sm focus:outline-none focus:border-blood"
                              />
                            ) : (
                              <span className="font-bold text-text-primary">{availableUnits}</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                statusColor === 'critical'
                                  ? 'bg-critical/10 text-critical'
                                  : statusColor === 'warning'
                                    ? 'bg-warning/10 text-warning'
                                    : 'bg-success/10 text-success'
                              }`}
                            >
                              {getStatusLabel(availableUnits)}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-text-muted text-xs">
                            {lastUpdated
                              ? new Date(lastUpdated).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'N/A'}
                          </td>
                          <td className="py-4 px-4 space-x-2 flex">
                            {isExisting ? (
                              isEditing ? (
                                <>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleSave(item._id, bg)}
                                    disabled={isSaving}
                                    icon={<Save className="w-3 h-3" />}
                                    className="text-xs"
                                  >
                                    {isSaving ? 'Saving' : 'Save'}
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="text-xs"
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                    className="text-xs"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(bg)}
                                    icon={<Trash2 className="w-3 h-3" />}
                                    className="text-xs"
                                  />
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => navigate(`/seeker/create-request?bloodGroup=${bg}&hospitalId=${hospitalId}`)}
                                    className="text-xs"
                                  >
                                    Request
                                  </Button>
                                </>
                              )
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleAddBloodGroup(bg)}
                                className="text-xs"
                              >
                                Add
                              </Button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Add New Blood Group */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Add Missing Blood Group</h3>
            <p className="text-sm text-text-muted">
              Select a blood group not yet in your inventory to add it:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bloodGroups
                .filter((bg) => !stock.find((s) => s.bloodGroup === bg))
                .map((bg) => (
                  <Button
                    key={bg}
                    variant="secondary"
                    onClick={() => handleAddBloodGroup(bg)}
                    className="text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add {bg}
                  </Button>
                ))}
            </div>

            {bloodGroups.filter((bg) => !stock.find((s) => s.bloodGroup === bg)).length === 0 && (
              <p className="text-xs text-text-muted italic">All blood groups are already in your inventory</p>
            )}
          </div>
        </Card>

        {/* Low Stock Alert */}
        {stock.some((item) => item.available < 5) && (
          <Card className="border-l-4 border-l-warning bg-warning/5">
            <div className="p-4 space-y-2">
              <p className="font-bold text-warning text-xs uppercase tracking-wider">Low Stock Alert</p>
              <p className="text-sm text-text-muted">
                {stock.filter((item) => item.available < 5).map((item) => item.bloodGroup).join(', ')} are below 5
                units. Consider requesting more from suppliers.
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default BloodStockManager
