using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ESEIM.Models
{
    public class CheckoutConfig
    {
        public string VnpUrl { get; set; }
        public string VnpReturnUrl { get; set; }
        public string VnpMobileReturnUrl { get; set; }

        public string MomoUrl { get; set; }
        public string MomoReturnUrl { get; set; }
        public string MomoMobileReturnUrl { get; set; }
        public string MomoAndroidReturnUrl { get; set; }
        public string MomoIosReturnUrl { get; set; }
    }
}
