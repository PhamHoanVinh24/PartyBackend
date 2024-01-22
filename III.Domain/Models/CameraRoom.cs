using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;


namespace ESEIM.Models
{
    [Table("CAMERA_ROOM")]
    public class CameraRoom
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string RoomId { get; set; }
        public string RoomName { get; set; }
        public string DepartmentCode { get; set; }
        public int? CameraQuantity { get; set; }
        public int? CameraAvailable { get; set; }
        public string Series { get; set; }
        public string Capacity { get; set; }
        public string DiskStatus { get; set; }
        public string SignalLossReason{ get; set; }
        public string Note { get; set; }
        public bool? DiskSaveable { get; set; }
        public string LoginInformation { get; set; }
        public string ImageLink { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
        public bool IsDeleted { get; set; }
    }
}