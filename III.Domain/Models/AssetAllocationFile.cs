using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("ASSET_ALLOCATE_FILE")]
    public class AssetAllocationFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(100)]
        public string FileCode { get; set; }
        [StringLength(100)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string FileName { get; set; }
    }
}
