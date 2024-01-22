
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("RM_GIS_TABLE")]
    public class RmGisTable
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Parent { get; set; }
        public string Type { get; set; }
        public string NodeGis { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }

    }
}
