using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_MAINTENANCE_HEADER")]
    public class AssetMaintenanceHeader
	{
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int TicketID { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string Title { get; set; }

		[StringLength(255)]
		public string Branch { get; set; }
		
		[StringLength(255)]
        public string DepartTransfer { get; set; }
		
		[StringLength(255)]
        public string UserTransfer { get; set; }

		public DateTime? StartTime { get; set; }

		[NotMapped]
		[StringLength(50)]
		public string sStartTime { get; set; }

		[StringLength(255)]
		public string LocationTransfer { get; set; }

		[StringLength(255)]
		public string UnitMaintenance { get; set; }

		public DateTime? ReceivedTime { get; set; }

		[NotMapped]
		[StringLength(50)]
		public string sReceivedTime { get; set; }

		[StringLength(255)]
		public string LocationReceived { get; set; }

		[StringLength(255)]
		public string Status { get; set; }

		[StringLength(255)]
		public string QRCode { get; set; }

		[StringLength(255)]
		public string Note { get; set; }

        [StringLength(255)]
        public string ObjActCode { get; set; }

        [StringLength(50)]
		public string CreatedBy { get; set; }

		public DateTime? CreatedTime { get; set; }

		[StringLength(50)]
		public string UpdatedBy { get; set; }

		public DateTime? UpdatedTime { get; set; }

		[StringLength(50)]
		public string DeletedBy { get; set; }

		public DateTime? DeletedTime { get; set; }

		public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string Currency { get; set; }

        public int TotalMoney { get; set; }

        [NotMapped]
		public List<ASMTNCStatus> ListStatus { get; set; }

		public string LogStatus
		{
			get
			{
				return JsonConvert.SerializeObject(ListStatus);
			}
			set
			{
				ListStatus = string.IsNullOrEmpty(value)
				? new List<ASMTNCStatus>()
				: JsonConvert.DeserializeObject<List<ASMTNCStatus>>(value);
			}
		}

        public string WorkflowCat { get; set; }

        public string JsonData { get; set; }
    }

	public class ASMTNCStatus
	{
		public string Type { get; set; }
		public string Status { get; set; }
		public string Reason { get; set; }
		public string CreatedBy { get; set; }
		public DateTime? CreatedTime { get; set; }
	}

}
