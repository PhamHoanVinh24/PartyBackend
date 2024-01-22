using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("CYLINKER_FUEL_LOADING_DT")]
    public class CylinkerFuelLoadingDt
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(255)]
        public string TankCode { get; set; }

        [StringLength(255)]
        public string CylinkerCode { get; set; }

        public decimal? Volume { get; set; }

        [StringLength(255)]
        public string Unit { get; set; }

    }
    public class CylinkerTest
    {
        public string Test { get; set;}
    }
}
