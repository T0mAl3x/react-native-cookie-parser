//
//  RNCookieParserModule.swift
//  RNCookieParserModule
//
//  Copyright © 2021 Tomei Alexandru. All rights reserved.
//

import Foundation

@objc(RNCookieParserModule)
class RNCookieParserModule: NSObject {
  @objc
  func constantsToExport() -> [AnyHashable : Any]! {
    return ["count": 1]
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
