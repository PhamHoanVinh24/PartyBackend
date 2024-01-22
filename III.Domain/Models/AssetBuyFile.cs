using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_BUY_FILE")]
    public class AssetBuyFile
	{
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

		[StringLength(255)]
		public string FileName { get; set; }		

		[StringLength(100)]
		public string FileCode { get; set; }
			   
		[StringLength(100)]
		public string TicketCode { get; set; }		
	}
}
