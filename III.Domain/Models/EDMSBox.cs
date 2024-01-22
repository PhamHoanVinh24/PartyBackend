using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("EDMS_BOX")]
    public class EDMSBox
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string BoxCode { get; set; }

        public string QR_Code { get; set; }

        [StringLength(255)]
        public string DepartCode { get; set; }

        [StringLength(255)]
        public string TypeProfile { get; set; }

        [StringLength(255)]
        public string BoxSize { get; set; }

        [StringLength(255)]
        public string M_CNT_Brief { get; set; }

        [StringLength(255)]
        public string CNT_Brief { get; set; }

        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        [StringLength(255)]
        public string NumBoxth { get; set; }

        public DateTime? StorageTime { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string LstMemberId { get; set; }

        [StringLength(255)]
        public string StatusBox { get; set; }

        [StringLength(255)]
        public string WHS_Code { get; set; }

        [StringLength(255)]
        public string FloorCode { get; set; }

        [StringLength(255)]
        public string LineCode { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string RackPosition { get; set; }

        [StringLength(255)]
        public string CNT_Cell { get; set; }

        [StringLength(255)]
        public string StatusSecurity { get; set; }

        public int StoragePeriod { get; set; }

        [StringLength(255)]
        public string RqCode { get; set; }

        [StringLength(255)]
        public string RcCode { get; set; }

        [StringLength(255)]
        public string RcExCode { get; set; }

        [StringLength(255)]
        public string RqExCode { get; set; }

        [StringLength(255)]
        public string LstTypeProfileId { get; set; }

        [StringLength(255)]
        public string Ordering { get; set; }
        public bool IsStored { get; set; }
    }

    public class EDMSBoxModel
    {
        public EDMSBoxModel()
        {
            ListFileBox = new List<FileUpload>();
            ListFileBoxRemove = new List<FileUpload>();
        }
        public int Id { get; set; }

        [StringLength(255)]
        public string BoxCode { get; set; }

        public string QR_Code { get; set; }

        [StringLength(255)]
        public string DepartCode { get; set; }

        [StringLength(255)]
        public string BrCode { get; set; }

        [StringLength(255)]
        public string TypeProfile { get; set; }

        [StringLength(255)]
        public string BranchName { get; set; }

        [StringLength(255)]
        public string TypeProfileName { get; set; }

        [StringLength(255)]
        public string BoxSize { get; set; }

        [StringLength(255)]
        public string M_CNT_Brief { get; set; }

        [StringLength(255)]
        public string CNT_Brief { get; set; }

        public string StartTime { get; set; }
        public string EndTime { get; set; }

        [StringLength(255)]
        public string NumBoxth { get; set; }

        public string StorageTime { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string LstMemberId { get; set; }

        [StringLength(255)]
        public string StatusBox { get; set; }

        [StringLength(255)]
        public string WHS_Code { get; set; }

        [StringLength(255)]
        public string FloorCode { get; set; }

        [StringLength(255)]
        public string LineCode { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string RackPosition { get; set; }

        [StringLength(255)]
        public string CNT_Cell { get; set; }

        [StringLength(255)]
        public string StatusSecurity { get; set; }

        public int StoragePeriod { get; set; }

        [StringLength(255)]
        public string RqCode { get; set; }

        [StringLength(255)]
        public string RcCode { get; set; }

        [StringLength(255)]
        public string RcExCode { get; set; }

        [StringLength(255)]
        public string RqExCode { get; set; }

        [StringLength(255)]
        public string LstTypeProfileId { get; set; }

        [StringLength(255)]
        public string Ordering { get; set; }

        public bool IsStored { get; set; }

        public List<FileUpload> ListFileBox { get; set; }
        public List<FileUpload> ListFileBoxRemove { get; set; }
    }

    public class BoxInfo : EDMSBoxModel
    {
        public BoxInfo()
        {
            BoxPosition = string.Format("{0}, {1}, {2}, {3}", BoxName, RackName, LineName, FloorName, WareHouseName);
        }
        public string WareHouseName { get; set; }
        public string FloorName { get; set; }
        public string LineName { get; set; }
        public string RackName { get; set; }
        public string BoxName { get; set; }
        public string BoxPosition { get; set; }
    }
}
