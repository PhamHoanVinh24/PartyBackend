﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
	[Table("ALLOWANCE_CONTRAINT")]
	public class AllowanceContraint
	{
		public AllowanceContraint()
		{
		}
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string AllowanceCatCode { get; set; }

        [StringLength(255)]
        public string ObjectCode { get; set; }

        [StringLength(255)]
        public string ObjFromValue { get; set; }

        [StringLength(255)]
        public string ObjToValue { get; set; }

        [StringLength(100)]
        public string Unit { get; set; }

        public decimal Price { get; set; }

        public string Currency { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        public string HistoryContraint { get; set; }

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
	}
}