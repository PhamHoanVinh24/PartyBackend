﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_IMPROVEMENT_DETAILS")]
    public class AssetImprovementDetails
	{
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AssetID { get; set; }

		[StringLength(50)]
		public string AssetCode { get; set; }

		public long TotalMoney { get; set; }

		[StringLength(255)]
		public string ListImage { get; set; }
			   
		[StringLength(255)]
		public string StatusAsset { get; set; }		

		[StringLength(500)]
		public string Note { get; set; }

		[StringLength(100)]
		public string TicketCode { get; set; }

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
		public int AssetQuantity { get; set; }
    }
}
